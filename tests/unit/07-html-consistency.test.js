/**
 * index.html içindeki kriter tanımları ile puanlama modülünün senkron
 * kalmasını garanti eder. Biri değişip diğeri değişmezse bu test kırılır —
 * klinik bir araçta sessiz puan kayması en tehlikeli hata sınıfıdır.
 */
"use strict";
var fs = require("fs"), path = require("path");
var S = require("../../assets/js/cnv-scoring.js");

var html = fs.readFileSync(path.join(__dirname, "..", "..", "index.html"), "utf8");

module.exports = function (suite) {
  suite("index.html ↔ puanlama modülü tutarlılığı", function (t) {
    /* pick('s2','2A',1.0, ...) çağrılarını çıkar */
    var re = /pick\('(s[0-9a-z]+)','([^']+)',(-?[0-9.]+)/g, m;
    var found = [], mismatch = [], missing = [];

    while ((m = re.exec(html)) !== null) {
      var section = m[1], key = m[2], pts = parseFloat(m[3]);
      found.push(key);
      var def = S.CRITERIA[key];
      if (!def) { missing.push(key); continue; }
      if (Math.abs(def.pts - pts) > 1e-9) {
        mismatch.push(key + ": HTML=" + pts + " modül=" + def.pts);
      }
      if (def.section !== section) {
        mismatch.push(key + ": bölüm HTML=" + section + " modül=" + def.section);
      }
    }

    t.ok(found.length > 50, "HTML'de en az 50 kriter butonu bulundu (" + found.length + ")");
    t.eq(missing, [], "HTML'deki her kriter modülde tanımlı");
    t.eq(mismatch, [], "HTML ve modül puanları / bölümleri birebir aynı");

    /* Modülde olup HTML'de olmayan kriter — ölü tanım uyarısı */
    var caseKeys = Object.keys(S.CASE_EVIDENCE);
    var orphan = Object.keys(S.CRITERIA).filter(function (k) {
      return found.indexOf(k) < 0 && caseKeys.indexOf(k) < 0;
    });
    t.eq(orphan, [], "modüldeki her kriter arayüzde kullanılıyor (ölü tanım yok)");
  });

  suite("index.html ↔ olgu kanıtı tutarlılığı", function (t) {
    var re = /pickS4a\('([^']+)',(-?[0-9.]+)/g, m;
    var mismatch = [], missing = [], found = [];
    while ((m = re.exec(html)) !== null) {
      var key = m[1], pts = parseFloat(m[2]);
      found.push(key);
      var def = S.CASE_EVIDENCE[key];
      if (!def) { missing.push(key); continue; }
      /* 4none ve 4D arayüzde 0 ile çağrılır; puan modülde tutulur */
      if (key !== "4none" && key !== "4D" && Math.abs(def.perCase - pts) > 1e-9) {
        mismatch.push(key + ": HTML=" + pts + " modül=" + def.perCase);
      }
    }
    t.ok(found.length >= 8, "olgu kanıtı seçenekleri bulundu (" + found.length + ")");
    t.eq(missing, [], "HTML'deki her olgu kanıtı anahtarı modülde tanımlı");
    t.eq(mismatch, [], "olgu başına puanlar birebir aynı");
  });

  suite("Sayfa bütünlüğü", function (t) {
    t.ok(html.indexOf('src="assets/js/cnv-scoring.js"') > 0, "puanlama modülü yükleniyor");
    t.ok(html.indexOf('src="assets/js/cnv-resources.js"') > 0, "kaynak modülü yükleniyor");
    t.ok(html.indexOf('src="assets/js/cnv-case.js"') > 0, "olgu modülü yükleniyor");
    t.ok(html.indexOf('src="assets/js/cnv-app.js"') > 0, "uygulama katmanı yükleniyor");

    /* Modüller inline script'ten ÖNCE yüklenmeli */
    t.ok(html.indexOf('src="assets/js/cnv-scoring.js"') < html.indexOf("function totalScore"),
      "puanlama modülü, onu kullanan inline koddan önce yüklenir");
    /* Uygulama katmanı inline script'ten SONRA yüklenmeli (sarmalama için) */
    t.ok(html.indexOf('src="assets/js/cnv-app.js"') > html.indexOf("function totalScore"),
      "uygulama katmanı inline koddan sonra yüklenir");

    t.ok(html.indexOf('id="stepEV"') > 0, "kanıt toplama adımı sayfada var");
    t.ok(html.indexOf('id="gateBox"') > 0, "kontrol uyarıları kutusu var");
    t.ok(html.indexOf('id="evBody"') > 0, "kanıt çalışma sayfası var");
    t.ok(html.indexOf('id="autosaveChk"') > 0, "otomatik kaydetme anahtarı var");
    t.ok(html.indexOf('id="mdOut"') > 0, "markdown çıktı alanı var");

    /* Eski kopya mantık geride kalmamalı */
    t.ok(html.indexOf("var capMap=") < 0, "eski tavan tablosu inline koddan kaldırıldı");
    t.ok(html.indexOf('return{cls:"Patojenik (P)",code:"p",color:') < 0,
      "eski sınıflandırma kopyası inline koddan kaldırıldı");
  });

  suite("Gizlilik sözleşmesi", function (t) {
    /* Uygulama hiçbir ağ çağrısı yapmamalı */
    var app = ["cnv-scoring.js", "cnv-resources.js", "cnv-case.js", "cnv-app.js"]
      .map(function (f) { return fs.readFileSync(path.join(__dirname, "..", "..", "assets", "js", f), "utf8"); })
      .join("\n");
    t.ok(!/\bfetch\s*\(/.test(app), "modüllerde fetch çağrısı yok");
    t.ok(!/XMLHttpRequest/.test(app), "modüllerde XMLHttpRequest yok");
    t.ok(!/navigator\.sendBeacon/.test(app), "modüllerde sendBeacon yok");
    t.ok(!/new\s+WebSocket/.test(app), "modüllerde WebSocket yok");
    t.ok(!/\bfetch\s*\(/.test(html), "index.html'de fetch çağrısı yok");
    t.ok(!/XMLHttpRequest/.test(html), "index.html'de XMLHttpRequest yok");

    /* Otomatik kaydetme varsayılan olarak kapalı olmalı */
    var caseSrc = fs.readFileSync(path.join(__dirname, "..", "..", "assets", "js", "cnv-case.js"), "utf8");
    t.ok(/localStorage\.getItem\(STORE_FLAG\)\s*===\s*"1"/.test(caseSrc),
      "otomatik kaydetme yalnızca açıkça işaretlenmişse etkin");
    t.ok(/function save\(data\)\s*\{\s*if \(!autosaveEnabled\(\)\) return false;/.test(caseSrc),
      "kaydetme, anahtar kapalıyken hiçbir şey yazmaz");
  });
};
