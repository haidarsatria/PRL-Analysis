import React, { useMemo, useState, useCallback } from "react";
import {
  TrendingUp, Star, Download, FileText,
  ChevronDown, ChevronUp, Award, BookOpen,
  AlertTriangle, Shield, SlidersHorizontal,
  RotateCcw, Info, Users,
} from "lucide-react";
import {
  getExpansionMatrix,
  getTotalUnits,
  getUniqueClients,
  getHHIRisk,
  getCategoryMeta,
} from "../utils/analytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Score Colour Helpers ─────────────────────────────────────────────────────

const SCORE_COLOR = (s) => s >= 80 ? "text-emerald-400" : s >= 55 ? "text-yellow-400" : "text-orange-400";
const SCORE_BG    = (s) => s >= 80 ? "bg-emerald-500/10 border-emerald-500/30" : s >= 55 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-orange-500/10 border-orange-500/30";
const PRIORITY    = (s) => s >= 80
  ? { label: "Prioritas Tinggi",    cls: "bg-emerald-500/20 text-emerald-300" }
  : s >= 55
  ? { label: "Prioritas Sedang",   cls: "bg-yellow-500/20 text-yellow-300" }
  : { label: "Perlu Dikaji",       cls: "bg-orange-500/20 text-orange-300" };

// ─── 1C: Weight Controls Component ───────────────────────────────────────────

const DEFAULT_WEIGHTS = { volume: 40, diversity: 35, demand: 25 };

function WeightControls({ weights, onChange }) {
  const total = weights.volume + weights.diversity + weights.demand || 1;
  const pct   = (k) => Math.round((weights[k] / total) * 100);

  const handleSlider = (key, val) => {
    onChange({ ...weights, [key]: Number(val) });
  };

  const sliders = [
    { key: "volume",    label: "Bobot Volume",             color: "accent-cyan-400",    barColor: "#00f3ff", desc: "Memprioritaskan instrumen yang dikalibrasi dalam jumlah besar" },
    { key: "diversity", label: "Bobot Keragaman Klien",    color: "accent-violet-400",  barColor: "#8b5cf6", desc: "Memprioritaskan ruang lingkup yang diminta oleh banyak klien berbeda" },
    { key: "demand",    label: "Bobot Frekuensi Permintaan", color: "accent-emerald-400", barColor: "#10b981", desc: "Memprioritaskan ruang lingkup yang paling sering muncul di pesanan" },
  ];

  return (
    <div className="rounded-xl p-5 space-y-4 cyber-card" style={{ borderColor: "rgba(0,243,255,0.12)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: "#8b5cf6" }} />
          <p className="text-sm font-bold" style={{ color: "#8b5cf6", fontFamily: "'Orbitron', monospace",
            fontSize: "0.65rem", letterSpacing: "0.05em" }}>
            Pengatur Bobot Skor
          </p>
        </div>
        <button
          onClick={() => onChange({ ...DEFAULT_WEIGHTS })}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors"
          style={{ color: "rgba(148,163,184,0.6)", border: "1px solid rgba(0,243,255,0.1)",
            fontFamily: "'Rajdhani', sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#00f3ff"; e.currentTarget.style.borderColor = "rgba(0,243,255,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(148,163,184,0.6)"; e.currentTarget.style.borderColor = "rgba(0,243,255,0.1)"; }}
        >
          <RotateCcw size={11} /> Atur Ulang
        </button>
      </div>

      {/* Weight stacked bar preview */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <div className="rounded-l-full transition-all duration-300" style={{ width: `${pct("volume")}%`,    background: "#00f3ff", boxShadow: "0 0 8px rgba(0,243,255,0.6)" }} />
        <div className="transition-all duration-300"               style={{ width: `${pct("diversity")}%`, background: "#8b5cf6", boxShadow: "0 0 8px rgba(139,92,246,0.6)" }} />
        <div className="rounded-r-full transition-all duration-300" style={{ width: `${pct("demand")}%`,   background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
      </div>
      <div className="flex text-xs gap-4">
        {sliders.map((s) => (
          <span key={s.key} className="flex items-center gap-1" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.barColor, boxShadow: `0 0 5px ${s.barColor}80` }} />
            {s.label.split(" ")[1]}: <strong style={{ color: "#e2e8f0", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>{pct(s.key)}%</strong>
          </span>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {sliders.map((s) => (
          <div key={s.key}>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>
                {s.label}
              </label>
              <span className="text-xs font-mono" style={{ color: s.barColor, fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
                {weights[s.key]}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[s.key]}
              onChange={(e) => handleSlider(s.key, e.target.value)}
              className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${s.color}`}
              style={{ background: `linear-gradient(to right, ${s.barColor} ${pct(s.key)}%, rgba(30,41,59,0.8) ${pct(s.key)}%)` }}
            />
            <p className="text-xs mt-1" style={{ color: "rgba(71,85,105,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(0,243,255,0.04)", border: "1px solid rgba(0,243,255,0.1)" }}>
        <Info size={12} className="text-slate-500 mt-0.5 shrink-0" style={{ color: "rgba(0,243,255,0.4)" }} />
        <p className="text-xs" style={{ color: "rgba(71,85,105,0.9)", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.8rem" }}>
          Bobot dinormalisasi otomatis — yang dikendalikan adalah <em>prioritas relatif</em> antara ketiga faktor.
          Data Anda hanya memiliki kolom <code style={{ color: "#00f3ff" }}>nama_perusahaan · nama_alat · spesifikasi · jumlah</code>, sehingga semua penilaian menggunakan empat kolom ini saja.
        </p>
      </div>
    </div>
  );
}

// ─── Score Progress Bar ───────────────────────────────────────────────────────

function ScoreBar({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 55 ? "#facc15" : "#fb923c";
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden mt-1"
      style={{ background: "rgba(30,41,59,0.8)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: color, boxShadow: `0 0 8px ${color}80` }}
      />
    </div>
  );
}

// ─── 1B: HHI Badge ────────────────────────────────────────────────────────────

function HHIBadge({ hhi, hhiRisk, topClient, topClientShare }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${hhiRisk.bg} ${hhiRisk.cls}`}
        style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}
      >
        {hhiRisk.level === "Kritis" && <AlertTriangle size={10} />}
        {hhiRisk.level === "Rendah" && <Shield size={10} />}
        HHI {hhi.toFixed(2)}
      </button>
      {showTip && (
        <div className="absolute bottom-full left-0 mb-2 w-60 rounded-xl px-3 py-2.5 shadow-2xl z-50 text-xs space-y-1"
          style={{ background: "rgba(5,5,10,0.98)", border: "1px solid rgba(0,243,255,0.25)",
            boxShadow: "0 0 20px rgba(0,243,255,0.15)" }}>
          <p className="font-bold" style={{ color: "#00f3ff", fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>
            Risiko Konsentrasi Klien
          </p>
          <p style={{ color: "rgba(148,163,184,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>{hhiRisk.desc}</p>
          <p className="mt-1" style={{ color: "rgba(100,116,139,0.9)", fontFamily: "'Rajdhani', sans-serif" }}>
            Klien utama: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{topClient}</span> ({topClientShare}%)
          </p>
          <p style={{ color: "rgba(71,85,105,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>
            Rentang HHI: 0 = terdiversifikasi · 1 = monopoli
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Score Breakdown Mini-chart ───────────────────────────────────────────────

function ScoreBreakdown({ breakdown, weights }) {
  const total = weights.volume + weights.diversity + weights.demand || 1;
  const items = [
    { label: "Volume",        val: breakdown.volume,    color: "#00f3ff",  pct: Math.round((weights.volume / total) * 100) },
    { label: "Keragaman",     val: breakdown.diversity, color: "#8b5cf6",  pct: Math.round((weights.diversity / total) * 100) },
    { label: "Frekuensi",     val: breakdown.demand,    color: "#10b981",  pct: Math.round((weights.demand / total) * 100) },
  ];
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold" style={{ color: "rgba(148,163,184,0.5)", fontFamily: "'Orbitron', monospace", fontSize: "0.58rem", letterSpacing: "0.05em" }}>
        Rincian Skor (bobot → kontribusi)
      </p>
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: it.color, boxShadow: `0 0 5px ${it.color}80` }} />
          <span className="w-20" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>{it.label}</span>
          <span className="w-10 text-right" style={{ color: "rgba(100,116,139,0.8)", fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>{it.pct}%</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,41,59,0.8)" }}>
            <div className="h-full rounded-full" style={{ width: `${it.val}%`, background: it.color, boxShadow: `0 0 6px ${it.color}60` }} />
          </div>
          <span className="w-6 text-right font-mono" style={{ color: "#e2e8f0", fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>{it.val}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────

function RecommendationCard({ item, index, weights }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY(item.score);
  const catMeta  = getCategoryMeta(item.category);

  return (
    <div className={`rounded-xl border ${SCORE_BG(item.score)} transition-all duration-300`}
      style={{ backdropFilter: "blur(8px)" }}>
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Rank */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "rgba(0,243,255,0.08)", border: "1px solid rgba(0,243,255,0.2)",
            color: "#00f3ff", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
          {index + 1}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-100 text-sm" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
              {item.nama_alat}
            </p>
            {/* 1A — category pill */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium border"
              style={{ color: catMeta.color, borderColor: catMeta.color + "44", backgroundColor: catMeta.color + "18",
                fontFamily: "'Rajdhani', sans-serif" }}
            >
              {catMeta.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.cls}`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {priority.label}
            </span>
          </div>
          <ScoreBar score={item.score} />
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-xs text-slate-500" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {item.totalUnits} unit · {item.clientCount} klien · Skor {item.score}/100
            </p>
            {/* 1B — HHI inline badge */}
            <HHIBadge
              hhi={item.hhi}
              hhiRisk={item.hhiRisk}
              topClient={item.topClient}
              topClientShare={item.topClientShare}
            />
          </div>
        </div>

        <div className={`shrink-0 font-bold text-lg ${SCORE_COLOR(item.score)}`}
          style={{ fontFamily: "'Orbitron', monospace", textShadow: item.score >= 80 ? "0 0 10px rgba(16,185,129,0.6)" : "" }}>
          {item.score}
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 pt-4" style={{ borderTop: "1px solid rgba(0,243,255,0.08)" }}>
          {/* HHI detail box */}
          <div className={`flex items-start gap-3 rounded-xl border p-3 ${item.hhiRisk.bg}`}>
            <Users size={14} className={`${item.hhiRisk.cls} mt-0.5 shrink-0`} />
            <div>
              <p className={`text-xs font-semibold ${item.hhiRisk.cls}`}
                style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>
                Risiko Klien: {item.hhiRisk.level} (HHI = {item.hhi.toFixed(2)})
              </p>
              <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{item.hhiRisk.desc}</p>
              <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Klien dominan: <strong className="text-slate-300">{item.topClient}</strong> ({item.topClientShare}% dari volume ruang lingkup)
              </p>
            </div>
          </div>

          {/* Score breakdown */}
          <ScoreBreakdown breakdown={item.scoreBreakdown} weights={weights} />

          {/* Reference standard */}
          <div className="flex items-start gap-2">
            <BookOpen size={14} style={{ color: "#00f3ff" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-0.5"
                style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.6rem", color: "#00f3ff" }}>
                Standar Acuan yang Direkomendasikan
              </p>
              <p className="text-xs text-slate-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{item.referenceStandard}</p>
            </div>
          </div>

          {/* KAN note */}
          <div className="flex items-start gap-2">
            <Award size={14} style={{ color: "#8b5cf6" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#8b5cf6", fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>
                Catatan Akreditasi KAN / ISO 17025
              </p>
              <p className="text-xs text-slate-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{item.accreditationNote}</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Unit",          val: item.totalUnits,  color: "#00f3ff" },
              { label: "Keragaman Klien",     val: item.clientCount, color: "#8b5cf6" },
              { label: "Frekuensi Permintaan", val: item.rowCount,    color: "#10b981" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(5,5,10,0.6)", border: `1px solid ${s.color}20` }}>
                <p className="text-lg font-bold" style={{ color: s.color, fontFamily: "'Orbitron', monospace",
                  textShadow: `0 0 10px ${s.color}60` }}>
                  {s.val}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(100,116,139,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(matrix) {
  const headers = ["Peringkat","Instrumen","Bidang","Skor","Unit","Klien","HHI","Risiko Klien","Klien Utama","Pangsa Klien Utama","Standar Acuan","Catatan KAN"];
  const rows = matrix.map((m, i) => [
    i + 1, m.nama_alat, getCategoryMeta(m.category).label,
    m.score, m.totalUnits, m.clientCount,
    m.hhi.toFixed(2), m.hhiRisk.level, m.topClient, `${m.topClientShare}%`,
    m.referenceStandard, m.accreditationNote,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "rekomendasi_ekspansi_kalibrasi.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportPDF(matrix, data) {
  const doc = new jsPDF({ orientation: "landscape" });
  const now = new Date().toLocaleString("id-ID");
  doc.setFillColor(5, 5, 10);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");
  doc.setTextColor(0, 243, 255);
  doc.setFontSize(15); doc.setFont("helvetica", "bold");
  doc.text("Laporan Analisis Ekspansi Ruang Lingkup Kalibrasi", 14, 12);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`Dibuat: ${now}  |  Total Unit: ${getTotalUnits(data)}  |  Klien: ${getUniqueClients(data)}`, 14, 22);

  autoTable(doc, {
    startY: 36,
    head: [["#","Instrumen","Bidang","Skor","Unit","Klien","HHI","Risiko Klien","Standar Acuan"]],
    body: matrix.map((m, i) => [
      i + 1, m.nama_alat, getCategoryMeta(m.category).label,
      `${m.score}/100`, m.totalUnits, m.clientCount,
      m.hhi.toFixed(2), m.hhiRisk.level, m.referenceStandard,
    ]),
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: [0, 50, 70], textColor: [0, 243, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [10, 15, 30] },
    columnStyles: {
      0: { cellWidth: 7 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 14, halign: "center" },
      6: { cellWidth: 12, halign: "center" },
      7: { cellWidth: 18 },
    },
  });
  doc.save("rekomendasi_ekspansi_kalibrasi.pdf");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecommendationPanel({ data }) {
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [showWeights, setShowWeights] = useState(false);
  const [hhiFilter, setHhiFilter] = useState("all"); // all | low | moderate | high | critical

  const matrix = useMemo(() => getExpansionMatrix(data, weights), [data, weights]);

  const filtered = useMemo(() => {
    if (hhiFilter === "all") return matrix;
    return matrix.filter((m) => m.hhiRisk.level.toLowerCase() === hhiFilter);
  }, [matrix, hhiFilter]);

  const HHI_FILTERS = [
    { val: "all",     label: "Semua Ruang Lingkup", cls: "bg-slate-700/60 text-slate-300 border-slate-600/60" },
    { val: "rendah",  label: "🟢 Risiko Rendah",    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    { val: "sedang",  label: "🟡 Sedang",            cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    { val: "tinggi",  label: "🟠 Risiko Tinggi",    cls: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    { val: "kritis",  label: "🔴 Kritis",            cls: "bg-red-500/15 text-red-300 border-red-500/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2"
            style={{ color: "#00f3ff", fontFamily: "'Orbitron', monospace", fontSize: "0.75rem",
              textShadow: "0 0 15px rgba(0,243,255,0.4)" }}>
            <TrendingUp size={18} style={{ color: "#10b981" }} />
            Rekomendasi Ekspansi Ruang Lingkup
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(100,116,139,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>
            Skor = Volume ({Math.round((weights.volume / (weights.volume + weights.diversity + weights.demand)) * 100)}%)
            + Keragaman ({Math.round((weights.diversity / (weights.volume + weights.diversity + weights.demand)) * 100)}%)
            + Permintaan ({Math.round((weights.demand / (weights.volume + weights.diversity + weights.demand)) * 100)}%)
            · Risiko HHI pada setiap ruang lingkup
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowWeights((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-300"
            style={showWeights ? {
              background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)",
              color: "#8b5cf6", boxShadow: "0 0 15px rgba(139,92,246,0.2)", fontFamily: "'Rajdhani', sans-serif",
            } : {
              background: "rgba(15,20,40,0.6)", border: "1px solid rgba(0,243,255,0.15)",
              color: "rgba(148,163,184,0.8)", fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <SlidersHorizontal size={13} /> Atur Bobot
          </button>
          <button
            onClick={() => exportCSV(matrix)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-300"
            style={{ background: "rgba(15,20,40,0.6)", border: "1px solid rgba(0,243,255,0.2)",
              color: "rgba(148,163,184,0.8)", fontFamily: "'Rajdhani', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,243,255,0.5)"; e.currentTarget.style.color = "#00f3ff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,243,255,0.2)"; e.currentTarget.style.color = "rgba(148,163,184,0.8)"; }}
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={() => exportPDF(matrix, data)}
            className="btn-neon flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
          >
            <FileText size={13} /> PDF
          </button>
        </div>
      </div>

      {/* 1C — Weight Tuner (collapsible) */}
      {showWeights && (
        <WeightControls weights={weights} onChange={setWeights} />
      )}

      {/* Priority Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "Prioritas Tinggi (80–100)", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
          { label: "Prioritas Sedang (55–79)",  cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
          { label: "Perlu Dikaji (< 55)",       cls: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
        ].map((l) => (
          <span key={l.label} className={`px-3 py-1 rounded-full font-medium border ${l.cls}`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {l.label}
          </span>
        ))}
      </div>

      {/* 1B — HHI Risk Filter */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "rgba(0,243,255,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.58rem" }}>
          Filter berdasarkan Risiko Konsentrasi Klien
        </p>
        <div className="flex flex-wrap gap-2">
          {HHI_FILTERS.map((f) => (
            <button
              key={f.val}
              onClick={() => setHhiFilter(f.val)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${f.cls}
                ${hhiFilter === f.val ? "ring-2 ring-white/20 scale-105" : "opacity-70 hover:opacity-100"}`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {f.label}
              <span className="ml-1.5 opacity-60">
                ({matrix.filter((m) => f.val === "all" || m.hhiRisk.level.toLowerCase() === f.val).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Highlight */}
      {matrix.length > 0 && (
        <div className="rounded-xl p-4" style={{ border: "1px solid rgba(250,204,21,0.2)", background: "rgba(250,204,21,0.03)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
            style={{ color: "#facc15", fontFamily: "'Orbitron', monospace", fontSize: "0.58rem",
              textShadow: "0 0 10px rgba(250,204,21,0.4)" }}>
            <Star size={12} /> 3 Target Ekspansi Utama
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {matrix.slice(0, 3).map((m, i) => {
              const cat = getCategoryMeta(m.category);
              return (
                <div key={m.nama_alat} className="rounded-xl px-4 py-3 space-y-1.5"
                  style={{ background: "rgba(5,5,10,0.8)", border: "1px solid rgba(250,204,21,0.1)" }}>
                  <p className="text-xs" style={{ color: "rgba(100,116,139,0.8)", fontFamily: "'Orbitron', monospace", fontSize: "0.55rem" }}>#{i + 1}</p>
                  <p className="font-bold text-slate-100 text-sm leading-snug" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
                    {m.nama_alat}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                      style={{ color: cat.color, borderColor: cat.color + "44", backgroundColor: cat.color + "18",
                        fontFamily: "'Rajdhani', sans-serif" }}>
                      {cat.label}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${m.hhiRisk.bg} ${m.hhiRisk.cls}`}
                      style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.55rem" }}>
                      HHI {m.hhi.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#facc15", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem",
                    textShadow: "0 0 8px rgba(250,204,21,0.5)" }}>
                    Skor: {m.score}/100
                  </p>
                  <p className="text-xs leading-snug" style={{ color: "rgba(100,116,139,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>
                    {m.referenceStandard}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm py-8 rounded-xl cyber-card"
            style={{ color: "rgba(0,243,255,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
            Tidak ada ruang lingkup yang sesuai dengan filter risiko ini.
          </p>
        ) : (
          filtered.map((item, i) => (
            <RecommendationCard key={item.nama_alat} item={item} index={i} weights={weights} />
          ))
        )}
      </div>
    </div>
  );
}
