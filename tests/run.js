#!/usr/bin/env node
/**
 * Sıfır bağımlılıklı test koşucusu.
 *   node tests/run.js
 * Başarısızlık durumunda çıkış kodu 1'dir (CI için).
 */
"use strict";
var fs = require("fs"), path = require("path");

var passed = 0, failed = 0, current = "";
var failures = [];

function eq(actual, expected, msg) {
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { passed++; return; }
  failed++;
  failures.push("  ✗ [" + current + "] " + msg + "\n      beklenen: " + e + "\n      alınan  : " + a);
}

function ok(cond, msg) { eq(!!cond, true, msg); }

function suite(name, fn) {
  current = name;
  console.log("\n── " + name);
  var before = failed;
  fn({ eq: eq, ok: ok });
  console.log("   " + (failed === before ? "tümü geçti" : (failed - before) + " başarısız"));
}

var dir = path.join(__dirname, "unit");
fs.readdirSync(dir).filter(function (f) { return /\.test\.js$/.test(f); }).sort()
  .forEach(function (f) { require(path.join(dir, f))(suite); });

console.log("\n" + "═".repeat(60));
if (failures.length) console.log(failures.join("\n"));
console.log((failed ? "BAŞARISIZ" : "BAŞARILI") + " — " + passed + " geçti, " + failed + " başarısız");
process.exit(failed ? 1 : 0);
