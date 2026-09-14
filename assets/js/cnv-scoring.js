/*!
 * cnv-scoring.js — ACMG/ClinGen (Riggs et al. 2020) CNV puanlama çekirdeği
 *
 * Saf (side-effect'siz) modül. Hem tarayıcıda (window.CNVScoring) hem de
 * Node altında (module.exports) çalışır; böylece aynı mantık otomatik
 * testlerle doğrulanabilir.
 *
 * Kaynak: Riggs ER, et al. Genet Med. 2020;22(2):245-257.
 *         Supplemental Material 1 — CNV Scoring Metrics.
 *
 * NOT: Bu modül yalnızca puan aritmetiğini ve sınıf eşiklerini uygular.
 *      Kriter seçimi klinik yorum gerektirir ve otomatikleştirilmemiştir.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CNVScoring = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ─────────────────────────────────────────────
     SINIF EŞİKLERİ — Riggs 2020, Table 1
     ───────────────────────────────────────────── */
  var THRESHOLDS = {
    pathogenic: 0.99,
    likelyPathogenic: 0.90,
    likelyBenign: -0.90,
    benign: -0.99
  };

  function classify(total) {
    var s = round2(total);
    if (s >= THRESHOLDS.pathogenic) return { cls: "Patojenik (P)", code: "p", en: "Pathogenic" };
    if (s >= THRESHOLDS.likelyPathogenic) return { cls: "Olası Patojenik (LP)", code: "lp", en: "Likely pathogenic" };
    if (s > THRESHOLDS.likelyBenign) return { cls: "VUS", code: "vus", en: "Uncertain significance" };
    if (s > THRESHOLDS.benign) return { cls: "Olası Benign (LB)", code: "lb", en: "Likely benign" };
    return { cls: "Benign (B)", code: "b", en: "Benign" };
  }

  /* ─────────────────────────────────────────────
     KRİTER KATALOĞU
     section: hangi bölüme yazılır
     type: 'loss' | 'gain' | 'both'
     ───────────────────────────────────────────── */
  var CRITERIA = {
    /* Section 1 — gen içeriği */
    "1A":    { section: "s1", pts: 0.00,  type: "both", label: "İntragenik CNV — Section 2'ye geç" },
    "1Ab":   { section: "s1", pts: 0.00,  type: "both", label: "Protein-kodlayan gen veya fonksiyonel element içeriyor" },
    "1B":    { section: "s1", pts: -0.60, type: "both", label: "Protein-kodlayan gen veya bilinen fonksiyonel element içermiyor" },

    /* Section 2 — LOSS */
    "2A":    { section: "s2", pts: 1.00,  type: "loss", label: "Kurulmuş HI gen/bölge ile tam örtüşme" },
    "2B":    { section: "s2", pts: 0.00,  type: "loss", label: "Kısmi örtüşme, kritik bölge etkilenmiyor" },
    "2C1":   { section: "s2", pts: 0.90,  type: "loss", label: "5′ uç etkileniyor, kodlayan dizi dahil" },
    "2C2":   { section: "s2", pts: 0.00,  type: "loss", label: "5′ uç etkileniyor, yalnızca 5′ UTR" },
    "2D1":   { section: "s2", pts: 0.00,  type: "loss", label: "3′ uç, yalnızca 3′ UTR" },
    "2D2":   { section: "s2", pts: 0.90,  type: "loss", label: "3′ uç, son ekzon, bilinen patojenik LOF varyant var" },
    "2D3":   { section: "s2", pts: 0.30,  type: "loss", label: "3′ uç, son ekzon, bilinen patojenik LOF varyant yok" },
    "2D4":   { section: "s2", pts: 0.90,  type: "loss", label: "3′ uç, son ekzon + ek ekzonlar, NMD bekleniyor" },
    "2E":    { section: "s2", pts: 0.90,  type: "loss", label: "İntragenik — PVS1 tam güç" },
    "2E_s":  { section: "s2", pts: 0.45,  type: "loss", label: "İntragenik — PVS1_Strong" },
    "2E_m":  { section: "s2", pts: 0.30,  type: "loss", label: "İntragenik — PVS1_Moderate" },
    "2E_sup":{ section: "s2", pts: 0.15,  type: "loss", label: "İntragenik — PVS1_Supporting" },
    "2E_na": { section: "s2", pts: 0.00,  type: "loss", label: "İntragenik — PVS1 uygulanamaz" },
    "2F":    { section: "s2", pts: -1.00, type: "loss", label: "Kurulmuş benign bölge ile tam örtüşme" },
    "2G":    { section: "s2", pts: 0.00,  type: "loss", label: "Benign bölge + ek genomik materyal" },
    "2H":    { section: "s2", pts: 0.15,  type: "loss", label: "≥2 HI prediktörü haploinsufficiency öngörüyor" },
    "2none": { section: "s2", pts: 0.00,  type: "loss", label: "Hiçbiri uygulanmıyor" },

    /* Section 2 — GAIN */
    "2A_d":    { section: "s2", pts: 1.00,  type: "gain", label: "Kurulmuş TS bölge ile tam örtüşme" },
    "2B_d":    { section: "s2", pts: 0.00,  type: "gain", label: "Kısmi örtüşme" },
    "2C_d":    { section: "s2", pts: -1.00, type: "gain", label: "Kurulmuş benign duplikasyon ile birebir örtüşme" },
    "2D_d":    { section: "s2", pts: -1.00, type: "gain", label: "Benign DUP içinde, ek materyal yok, protein-kodlayan gen kesmiyor" },
    "2E_d":    { section: "s2", pts: 0.00,  type: "gain", label: "Benign DUP içinde ama kırılma noktası gen kesiyor" },
    "2F_d":    { section: "s2", pts: -1.00, type: "gain", label: "Benign DUP'u kapsıyor, ek materyal yok" },
    "2G_d":    { section: "s2", pts: 0.00,  type: "gain", label: "Kurulmuş TS/benign bölge ile örtüşme yok" },
    "2H_d":    { section: "s2", pts: 0.00,  type: "gain", label: "HI gen tamamen kapsanıyor — devam et" },
    "2I_d":    { section: "s2", pts: 0.90,  type: "gain", label: "İntragenik DUP — PVS1 tam güç" },
    "2I_d_s":  { section: "s2", pts: 0.45,  type: "gain", label: "İntragenik DUP — PVS1_Strong" },
    "2I_d_na": { section: "s2", pts: 0.00,  type: "gain", label: "İntragenik DUP — PVS1 uygulanamaz" },
    "2J_d":    { section: "s2", pts: 0.00,  type: "gain", label: "İntragenik DUP — triplosensitif öngörülmüyor" },
    "2K_d":    { section: "s2", pts: 0.45,  type: "gain", label: "Bir kırılma noktası HI gende, fenotip LOF ile uyumlu" },
    "2L_d":    { section: "s2", pts: 0.00,  type: "gain", label: "Kırılma noktası gen kesiyor ama HI/TS değil" },
    "2none_d": { section: "s2", pts: 0.00,  type: "gain", label: "Hiçbiri uygulanmıyor" },

    /* Section 3 — protein-kodlayan gen sayısı */
    "3A_d": { section: "s3", pts: 0.00, type: "loss", label: "0–24 protein-kodlayan gen" },
    "3B_d": { section: "s3", pts: 0.45, type: "loss", label: "25–34 protein-kodlayan gen" },
    "3C_d": { section: "s3", pts: 0.90, type: "loss", label: "≥35 protein-kodlayan gen" },
    "3A_u": { section: "s3", pts: 0.00, type: "gain", label: "0–34 protein-kodlayan gen" },
    "3B_u": { section: "s3", pts: 0.45, type: "gain", label: "35–49 protein-kodlayan gen" },
    "3C_u": { section: "s3", pts: 0.90, type: "gain", label: "≥50 protein-kodlayan gen" },

    /* Section 4 — segregasyon */
    "4F":         { section: "s4seg", pts: 0.15,  type: "both", label: "3–4 segregasyon gözlemi" },
    "4G":         { section: "s4seg", pts: 0.30,  type: "both", label: "5–6 segregasyon gözlemi" },
    "4H":         { section: "s4seg", pts: 0.45,  type: "both", label: "≥7 segregasyon gözlemi" },
    "4I":         { section: "s4seg", pts: -0.45, type: "both", label: "Etkilenmiş aile üyesinde varyant yok (spesifik fenotip)" },
    "4J":         { section: "s4seg", pts: -0.30, type: "both", label: "Etkilenmemiş aile üyesinde varyant var (spesifik fenotip)" },
    "4K":         { section: "s4seg", pts: -0.15, type: "both", label: "Etkilenmemiş aile üyesinde varyant var (nonspesifik fenotip)" },
    "4seg_none":  { section: "s4seg", pts: 0.00,  type: "both", label: "Segregasyon verisi yok" },

    /* Section 4 — olgu-kontrol / popülasyon */
    "4L":         { section: "s4b", pts: 0.45,  type: "both", label: "Olgu-kontrol: anlamlı artış, spesifik fenotip" },
    "4M":         { section: "s4b", pts: 0.30,  type: "both", label: "Olgu-kontrol: anlamlı artış, nonspesifik fenotip" },
    "4N":         { section: "s4b", pts: -0.90, type: "both", label: "Olgu-kontrol: anlamlı fark yok" },
    "4O":         { section: "s4b", pts: -1.00, type: "both", label: "Genel popülasyonda >%1 sıklık" },
    "4pop_none":  { section: "s4b", pts: 0.00,  type: "both", label: "Popülasyon verisi değerlendirilmedi" },

    /* Section 5 — kalıtım */
    "5A":    { section: "s5", pts: 0.45,  type: "both", label: "De novo (her iki ebeveyn teyitli), yüksek özgüllükte fenotip" },
    "5A2":   { section: "s5", pts: 0.30,  type: "both", label: "De novo (teyitli), fenotip tutarlı ama özgül değil" },
    "5B":    { section: "s5", pts: -0.30, type: "both", label: "Etkilenmemiş ebeveynden kalıtılmış (spesifik fenotip)" },
    "5C":    { section: "s5", pts: -0.15, type: "both", label: "Etkilenmemiş ebeveynden kalıtılmış (nonspesifik fenotip)" },
    "5D_34": { section: "s5", pts: 0.15,  type: "both", label: "Ailede 3–4 segregasyon" },
    "5D_56": { section: "s5", pts: 0.30,  type: "both", label: "Ailede 5–6 segregasyon" },
    "5D_7":  { section: "s5", pts: 0.45,  type: "both", label: "Ailede ≥7 segregasyon" },
    "5E_i":  { section: "s5", pts: -0.45, type: "both", label: "Etkilenmiş aile üyesinde varyant yok" },
    "5E_j":  { section: "s5", pts: -0.30, type: "both", label: "Etkilenmemiş üyede varyant var (spesifik fenotip)" },
    "5E_k":  { section: "s5", pts: -0.15, type: "both", label: "Etkilenmemiş üyede varyant var (nonspesifik fenotip)" },
    "5F":    { section: "s5", pts: 0.00,  type: "both", label: "Kalıtım bilgisi yok" },
    "5G":    { section: "s5", pts: 0.10,  type: "both", label: "Kalıtım bilinmiyor; nonspesifik fenotip, benzer olgularla tutarlı" },
    "5H":    { section: "s5", pts: 0.30,  type: "both", label: "Kalıtım bilinmiyor; fenotip yüksek özgüllükte (gain için audit gerektirir)" }
  };

  /* ─────────────────────────────────────────────
     Section 4A — olgu kanıtı (vaka sayısıyla çarpılır, tavanlı)
     ───────────────────────────────────────────── */
  var CASE_EVIDENCE = {
    "4A_conf": { perCase: 0.45, cap: 0.90, label: "Fenotip yüksek özgüllükte, de novo teyitli" },
    "4A_assu": { perCase: 0.30, cap: 0.90, label: "Fenotip yüksek özgüllükte, de novo varsayılmış" },
    "4B_conf": { perCase: 0.30, cap: 0.90, label: "Fenotip tutarlı ama özgül değil, de novo teyitli" },
    "4B_assu": { perCase: 0.15, cap: 0.90, label: "Fenotip tutarlı ama özgül değil, de novo varsayılmış" },
    "4C_conf": { perCase: 0.15, cap: 0.90, label: "Fenotip nonspesifik, de novo teyitli" },
    "4C_assu": { perCase: 0.10, cap: 0.90, label: "Fenotip nonspesifik, de novo varsayılmış" },
    "4D":      { perCase: -0.30, cap: -0.30, label: "Fenotip tutarsız — olgu başına −0.30, toplam −0.30" },
    "4E":      { perCase: 0.10, cap: 0.30, label: "Olgu bildirimi, kalıtım bilinmiyor" },
    "4none":   { perCase: 0.00, cap: 0.00, label: "Olgu kanıtı bulunamadı" }
  };

  /**
   * Section 4A toplamı: olgu başına puan × olgu sayısı, tavanla sınırlı.
   * 4D negatif yönde tek seferlik −0.30 ile sınırlıdır.
   */
  function caseEvidenceTotal(key, caseCount) {
    var def = CASE_EVIDENCE[key];
    if (!def) return 0;
    var n = Math.max(1, parseInt(caseCount, 10) || 1);
    if (key === "4none") return 0;
    if (def.perCase < 0) return round2(Math.max(def.perCase * n, def.cap));
    return round2(Math.min(def.perCase * n, def.cap));
  }

  /* ─────────────────────────────────────────────
     TOPLAM
     ───────────────────────────────────────────── */
  var SECTIONS = ["s1", "s2", "s3", "s4a", "s4seg", "s4b", "s5"];

  function total(scores) {
    return round2(SECTIONS.reduce(function (a, k) {
      return a + (Number(scores && scores[k]) || 0);
    }, 0));
  }

  /** Bir kriter anahtarından puanı döndürür (bilinmeyen anahtar → null). */
  function pointsFor(key) {
    if (CRITERIA[key]) return CRITERIA[key].pts;
    if (CASE_EVIDENCE[key]) return CASE_EVIDENCE[key].perCase;
    return null;
  }

  function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function fmt(n) {
    var v = round2(n);
    return (v >= 0 ? "+" : "") + v.toFixed(2);
  }

  return {
    THRESHOLDS: THRESHOLDS,
    CRITERIA: CRITERIA,
    CASE_EVIDENCE: CASE_EVIDENCE,
    SECTIONS: SECTIONS,
    classify: classify,
    caseEvidenceTotal: caseEvidenceTotal,
    total: total,
    pointsFor: pointsFor,
    round2: round2,
    fmt: fmt
  };
});
