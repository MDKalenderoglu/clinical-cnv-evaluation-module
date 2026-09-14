/*!
 * cnv-app.js — v0.2 özelliklerinin arayüze bağlanması.
 * Mevcut inline script'ten SONRA yüklenir; oradaki global fonksiyonları
 * sarmalayarak (monkey-patch) davranış ekler, mevcut mantığı değiştirmez.
 */
(function () {
  "use strict";

  var S = window.CNVScoring, R = window.CNVResources, C = window.CNVCase;
  if (!S || !R || !C) { console.error("CNV modülleri yüklenemedi."); return; }

  /* ═══ Adım sırası ═══════════════════════════════════════ */
  var STEPS = ["stepN1", "step0", "step1", "stepEV", "step2", "step3", "step4",
               "step5", "step6", "step7", "step8", "step9", "step10", "step11",
               "step12", "step13"];
  var NAV_OF = { stepN1: "navN1", stepEV: "navEV" };
  STEPS.forEach(function (id) { if (!NAV_OF[id]) NAV_OF[id] = id.replace("step", "nav"); });

  var _goTo = window.goTo;

  /** Adım kimliğiyle gezinme (yeni adımlar numaralandırmayı bozmaz). */
  window.goStep = function (stepId) {
    var idx = STEPS.indexOf(stepId);
    if (idx < 0) return;
    document.querySelectorAll(".step-card").forEach(function (c) { c.classList.remove("active"); });
    document.querySelectorAll(".nav-item").forEach(function (i) { i.classList.remove("active"); });
    var rs = document.getElementById("resultScreen");
    if (rs) rs.classList.remove("active");
    document.getElementById("mainWrap").style.display = "block";
    var se = document.getElementById(stepId), ne = document.getElementById(NAV_OF[stepId]);
    if (se) se.classList.add("active");
    if (ne) ne.classList.add("active");
    window.__curStep = stepId;
    document.getElementById("progFill").style.width = ((idx / (STEPS.length + 1)) * 100) + "%";
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof closeMob === "function") closeMob();
    if (stepId === "stepEV") refreshEvidence();
  };

  /* Eski sayısal goTo çağrılarını adım kimliğine çevir */
  window.goTo = function (n) {
    var id = n === -1 ? "stepN1" : "step" + n;
    if (STEPS.indexOf(id) >= 0) return window.goStep(id);
    return _goTo(n);
  };

  /* Klavye gezinmesini yeni sıraya uyarla */
  document.addEventListener("keydown", function (e) {
    if (["INPUT", "TEXTAREA", "SELECT"].indexOf(e.target.tagName) >= 0) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var rs = document.getElementById("resultScreen");
    if (rs && rs.classList.contains("active")) {
      if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); window.goStep("step13"); }
      return;
    }
    var i = STEPS.indexOf(window.__curStep || "stepN1");
    if (i < 0) return;
    e.preventDefault(); e.stopPropagation();
    if (e.key === "ArrowRight") { if (i < STEPS.length - 1) window.goStep(STEPS[i + 1]); else showResult(); }
    else if (i > 0) window.goStep(STEPS[i - 1]);
  }, true);

  /* ═══ Olgu durumu ═══════════════════════════════════════ */

  function scoringState() {
    return {
      sc: window.sc, sel: window.sel, cnvT: window.cnvT,
      s4aKey: window.s4aKey, s4aPPCase: window.s4aPPCase
    };
  }

  function applyScoringState(st) {
    if (!st) return;
    if (st.sc) window.sc = st.sc;
    if (st.sel) window.sel = st.sel;
    if (st.cnvT) window.cnvT = st.cnvT;
    if (st.s4aKey !== undefined) window.s4aKey = st.s4aKey;
    if (st.s4aPPCase !== undefined) window.s4aPPCase = st.s4aPPCase;

    /* Seçili kriterleri arayüzde tekrar işaretle */
    Object.keys(window.sel || {}).forEach(function (sec) {
      var key = window.sel[sec];
      document.querySelectorAll(".choice-opt").forEach(function (el) {
        var oc = el.getAttribute("onclick") || "";
        if (oc.indexOf("'" + key + "'") >= 0 && oc.indexOf("'" + sec + "'") >= 0) el.classList.add("selected");
      });
      if (window.sc && window.sc[sec] !== undefined && typeof updPts === "function") updPts(sec, window.sc[sec]);
    });
    if (window.s4aKey) {
      document.querySelectorAll(".choice-opt").forEach(function (el) {
        var oc = el.getAttribute("onclick") || "";
        if (oc.indexOf("pickS4a('" + window.s4aKey + "'") >= 0) el.classList.add("selected");
      });
      if (typeof updPts === "function") updPts("s4a", window.sc.s4a);
    }
    if (window.cnvT) {
      var dc = document.getElementById("del-choices"), uc = document.getElementById("dup-choices");
      if (dc) dc.style.display = window.cnvT === "del" ? "block" : "none";
      if (uc) uc.style.display = window.cnvT === "dup" ? "block" : "none";
      document.querySelectorAll("#cnvTypeOpts .choice-opt").forEach(function (el) {
        if ((el.getAttribute("onclick") || "").indexOf("'" + window.cnvT + "'") >= 0) el.classList.add("selected");
      });
    }
    if (typeof updBadge === "function") updBadge();
  }

  function patientState() {
    var g = function (id) { var e = document.getElementById(id); return e ? e.value || "" : ""; };
    return {
      build: g("ptBuild"), coord: g("ptCoord"), iscn: g("ptISCN"), testType: g("ptTestType"),
      platform: g("ptPlatform"), cnvType: g("ptCnvType"), copyState: g("ptCopyState"),
      genes: g("ptGenes"), geneCount: g("ptGeneCount"), parentTest: g("ptParent"),
      pheno: g("ptPheno"), hpo: g("ptHpo"), size: g("ptSize"), cytoband: g("ptCytoband")
    };
  }

  /* ═══ Kanıt adımı ═══════════════════════════════════════ */

  function renderGates() {
    var box = document.getElementById("gateBox");
    if (!box) return;
    var gs = R.gates(patientState());
    if (!gs.length) {
      box.innerHTML = '<div class="gate gate-ok"><span class="gate-ico">OK</span>' +
        '<div class="gate-body"><strong>Engelleyici kontrol uyarısı yok</strong>' +
        'Bu, değerlendirmenin doğru olduğu anlamına gelmez — yalnızca otomatik kontrol edilebilen tutarsızlık bulunmadığını gösterir.</div></div>';
      return;
    }
    var order = { block: 0, warn: 1, info: 2 };
    var ico = { block: "DUR", warn: "!", info: "i" };
    box.innerHTML = gs.sort(function (a, b) { return order[a.level] - order[b.level]; })
      .map(function (g) {
        return '<div class="gate gate-' + g.level + '"><span class="gate-ico">' + ico[g.level] + '</span>' +
               '<div class="gate-body"><strong>' + esc(g.title) + '</strong>' + esc(g.text) + '</div></div>';
      }).join("");
  }

  function renderLinks() {
    var box = document.getElementById("linkBox"), st = document.getElementById("linkStatus");
    if (!box) return;
    var ps = patientState();
    var c = R.parseCoord(ps.coord);
    if (!c) {
      box.innerHTML = '<div class="gate gate-warn"><span class="gate-ico">!</span><div class="gate-body">' +
        '<strong>Koordinat gerekli</strong>Bağlantıları üretmek için olgu kartında geçerli bir CNV koordinatı girin (örn. chr15:22646694-23086471).</div></div>';
      if (st) st.textContent = "";
      return;
    }
    if (!ps.build) {
      box.innerHTML = '<div class="gate gate-block"><span class="gate-ico">DUR</span><div class="gate-body">' +
        '<strong>Genome build gerekli</strong>Build seçilmeden bağlantı üretilmez. Yanlış build ile sorgulamak gen içeriğini tamamen değiştirir.</div></div>';
      if (st) st.textContent = "";
      return;
    }
    var groups = R.buildLinks(c, ps.build, { genes: ps.genes, cytoband: ps.cytoband });
    box.innerHTML = groups.map(function (g) {
      return '<div class="lnk-group"><div class="lnk-head"><div class="lnk-head-t">' + esc(g.title) + '</div>' +
        '<div class="lnk-head-w">' + esc(g.why) + '</div></div><div class="lnk-list">' +
        g.links.map(function (l) {
          return '<div class="lnk-row"><a class="lnk-a" href="' + escAttr(l.url) + '" target="_blank" rel="noopener noreferrer">' +
                 esc(l.name) + ' ↗</a><span class="lnk-n">' + esc(l.note) + '</span></div>';
        }).join("") + '</div></div>';
    }).join("");
    if (st) st.textContent = "chr" + c.chr + ":" + c.start.toLocaleString("tr-TR") + "-" +
      c.end.toLocaleString("tr-TR") + " · " + R.formatSize(c.length) + " · " + ps.build +
      " — bağlantılar bu bilgiden üretildi.";
  }

  function renderEvidenceTable() {
    var body = document.getElementById("evBody");
    if (!body || body.childElementCount) { updateEvProgress(); return; }
    body.innerHTML = C.EVIDENCE_ROWS.map(function (r) {
      return '<tr id="' + r.id + '_row">' +
        '<td><input type="checkbox" class="ev-chk" id="' + r.id + '_done" onchange="evTouch()"></td>' +
        '<td><div class="ev-src">' + esc(r.src) + '</div><div class="ev-ask">' + esc(r.ask) + '</div></td>' +
        '<td><input type="text" id="' + r.id + '" placeholder="Bulgunuzu yazın…" oninput="evTouch()"></td>' +
        '<td><span class="ev-feeds">' + esc(r.feeds) + '</span></td></tr>';
    }).join("");
    updateEvProgress();
  }

  function updateEvProgress() {
    var done = 0;
    C.EVIDENCE_ROWS.forEach(function (r) {
      var el = document.getElementById(r.id + "_done");
      var row = document.getElementById(r.id + "_row");
      if (el && row) row.classList.toggle("ev-done", el.checked);
      if (el && el.checked) done++;
    });
    var p = document.getElementById("evProgress");
    if (p) {
      var n = C.EVIDENCE_ROWS.length;
      p.textContent = done + " / " + n + " kaynak sorgulandı." +
        (done < n ? " Sorgulanmamış kaynaklar rapor özetinde eksik kanıt olarak listelenir." : " Tüm kaynaklar işaretlendi.");
    }
  }

  window.evTouch = function () { updateEvProgress(); scheduleSave(); };

  window.refreshEvidence = function () {
    renderEvidenceTable();
    renderGates();
    renderLinks();
  };

  function evidenceForReport() {
    return C.EVIDENCE_ROWS.map(function (r) {
      var v = document.getElementById(r.id), d = document.getElementById(r.id + "_done");
      return { src: r.src, ask: r.ask, feeds: r.feeds, value: v ? v.value : "", done: d ? d.checked : false };
    });
  }

  /* ═══ Kaydetme / yükleme ════════════════════════════════ */

  var saveTimer = null;
  function scheduleSave() {
    if (!C.autosaveEnabled()) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      C.save(C.collect(document, scoringState()));
      setStatus("Otomatik kaydedildi · " + new Date().toLocaleTimeString("tr-TR"));
    }, 600);
  }

  function setStatus(msg) {
    var el = document.getElementById("caseStatus");
    if (el) el.textContent = msg;
  }

  window.toggleAutosave = function (on) {
    if (on) {
      var ok = confirm(
        "Otomatik kaydetme açılacak.\n\n" +
        "Girdiğiniz TÜM veriler — hasta tanımlayıcıları dahil — bu tarayıcının yerel deposuna (localStorage) yazılacak " +
        "ve siz silene kadar bu cihazda kalacaktır.\n\n" +
        "Ortak kullanılan bir bilgisayarda bunu AÇMAYIN.\n\n" +
        "Devam edilsin mi?");
      if (!ok) { document.getElementById("autosaveChk").checked = false; return; }
    }
    C.setAutosave(on);
    if (on) { scheduleSave(); setStatus("Otomatik kaydetme AÇIK — veriler bu cihazda saklanıyor."); }
    else setStatus("Otomatik kaydetme kapalı — yerel kayıt silindi.");
  };

  window.clearStoredCase = function () {
    if (!confirm("Bu tarayıcıda saklanan olgu taslağı kalıcı olarak silinsin mi?")) return;
    C.clearStored();
    setStatus("Yerel kayıt silindi.");
  };

  window.exportCase = function () {
    var data = C.collect(document, scoringState());
    var name = (data.fields.ptId || "olgu").replace(/[^\w.\-]+/g, "_");
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "CNV_olgu_" + name + "_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setStatus("Olgu dosyası indirildi.");
  };

  window.importCase = function (input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var r = new FileReader();
    r.onload = function (e) {
      var data;
      try { data = JSON.parse(e.target.result); }
      catch (err) { alert("Dosya okunamadı: geçerli bir JSON değil."); input.value = ""; return; }
      if (!confirm("Yüklenen olgu mevcut tüm girdilerin yerine geçecek. Devam edilsin mi?")) { input.value = ""; return; }
      var res = C.apply(data, document, applyScoringState);
      input.value = "";
      if (!res.ok) { alert(res.msg); return; }
      if (typeof syncPatientState === "function") syncPatientState();
      if (typeof applyMode === "function") applyMode(document.getElementById("ptMode").value);
      refreshEvidence();
      setStatus(res.msg + (data.savedAt ? " (kayıt: " + new Date(data.savedAt).toLocaleString("tr-TR") + ")" : ""));
    };
    r.readAsText(file);
  };

  /* ═══ Markdown özet ═════════════════════════════════════ */

  function markdownContext() {
    var fields = C.collect(document, null).fields;
    var t = S.total(window.sc);
    return {
      fields: fields,
      scoring: { sc: window.sc, sel: window.sel, total: t, classification: S.classify(t).cls },
      evidence: evidenceForReport(),
      gates: R.gates(patientState()),
      limitations: R.limitationsText(patientState())
    };
  }

  window.showMarkdown = function () {
    var panel = document.getElementById("mdPanel"), out = document.getElementById("mdOut");
    if (!panel || !out) return;
    out.value = C.toMarkdown(markdownContext());
    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.copyMarkdown = function () {
    var out = document.getElementById("mdOut"), st = document.getElementById("mdStatus");
    if (!out || !out.value) return;
    var done = function () { if (st) st.textContent = "Panoya kopyalandı."; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out.value).then(done).catch(function () { out.select(); document.execCommand("copy"); done(); });
    } else { out.select(); document.execCommand("copy"); done(); }
  };

  window.dlMarkdown = function () {
    var out = document.getElementById("mdOut");
    if (!out || !out.value) return;
    var id = (document.getElementById("ptId").value || "rapor").replace(/[^\w.\-]+/g, "_");
    var blob = new Blob([out.value], { type: "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "CNV_ozet_" + id + ".md"; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  /* ═══ Mevcut fonksiyonların sarmalanması ════════════════ */

  function wrap(name, after) {
    var f = window[name];
    if (typeof f !== "function") return;
    window[name] = function () {
      var r = f.apply(this, arguments);
      try { after.apply(this, arguments); } catch (e) { console.warn(name, e); }
      return r;
    };
  }

  wrap("pick", scheduleSave);
  wrap("pickS4a", scheduleSave);
  wrap("updateS4a", scheduleSave);
  wrap("setCNVType", scheduleSave);
  wrap("parseReportText", function () { refreshEvidence(); scheduleSave(); });
  wrap("saveAndContinue", scheduleSave);
  wrap("resetAll", function () {
    var p = document.getElementById("mdPanel");
    if (p) p.style.display = "none";
    refreshEvidence();
    scheduleSave();
  });

  /* ═══ Yardımcılar ═══════════════════════════════════════ */

  function esc(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(String(s == null ? "" : s)));
    return d.innerHTML;
  }
  function escAttr(s) { return esc(s).replace(/"/g, "&quot;"); }

  /* ═══ Başlangıç ═════════════════════════════════════════ */

  document.addEventListener("DOMContentLoaded", function () {
    renderEvidenceTable();

    var chk = document.getElementById("autosaveChk");
    if (chk && C.autosaveEnabled()) {
      chk.checked = true;
      var saved = C.load();
      if (saved) {
        var when = saved.savedAt ? new Date(saved.savedAt).toLocaleString("tr-TR") : "bilinmeyen tarih";
        if (confirm("Bu tarayıcıda kaydedilmiş bir olgu taslağı var (" + when + ").\n\nYüklensin mi?")) {
          C.apply(saved, document, applyScoringState);
          if (typeof syncPatientState === "function") syncPatientState();
          if (typeof applyMode === "function") applyMode(document.getElementById("ptMode").value);
          setStatus("Taslak geri yüklendi · " + when);
        } else {
          setStatus("Otomatik kaydetme AÇIK — kayıtlı taslak yüklenmedi.");
        }
      } else {
        setStatus("Otomatik kaydetme AÇIK — veriler bu cihazda saklanıyor.");
      }
    }

    /* Olgu kartındaki değişikliklerde kapıları/linkleri tazele */
    ["ptCoord", "ptBuild", "ptISCN", "ptTestType", "ptCnvType", "ptCopyState",
     "ptGenes", "ptGeneCount", "ptParent", "ptPheno", "ptHpo", "ptCytoband"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", function () { refreshEvidence(); scheduleSave(); });
      el.addEventListener("input", scheduleSave);
    });
    C.FIELD_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", scheduleSave);
    });

    window.__curStep = "stepN1";
  });
})();
