import React, { useMemo, useState } from "react";
import {
  Activity, Users, Gauge, TrendingUp, Search, X, Layers,
} from "lucide-react";
import {
  getTotalUnits,
  getUniqueClients,
  getUniqueScopes,
  getTopScope,
  getTopEquipment,
  getClientConcentration,
  getExpansionMatrix,
  getCategoryBreakdown,
  getCategory,
  getCategoryMeta,
  CATEGORIES,
} from "../utils/analytics";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color, glowColor }) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 border border-white/5 ${color} shadow-lg transition-all duration-300`}
      style={{ boxShadow: `0 0 20px ${glowColor}30` }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}50`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}30`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: `${glowColor}99`, fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>
            {label}
          </p>
          <p className="text-3xl font-extrabold text-white leading-tight"
            style={{ fontFamily: "'Orbitron', monospace", textShadow: `0 0 15px ${glowColor}60` }}>
            {value}
          </p>
          {sub && <p className="text-xs text-white/50 mt-1 truncate max-w-[160px]"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}>{sub}</p>}
        </div>
        <div className="p-3 rounded-xl" style={{ background: `${glowColor}18`, border: `1px solid ${glowColor}30` }}>
          <Icon size={22} style={{ color: glowColor }} />
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full" style={{ background: `${glowColor}08` }} />
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function FilterBar({ search, setSearch }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,243,255,0.5)" }} />
      <input
        type="text"
        placeholder="Cari berdasarkan nama alat, klien, atau spesifikasi…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all duration-300"
        style={{
          background: "rgba(15,20,40,0.8)",
          border: "1px solid rgba(0,243,255,0.15)",
          fontFamily: "'Rajdhani', sans-serif",
        }}
        onFocus={e => {
          e.target.style.border = "1px solid rgba(0,243,255,0.5)";
          e.target.style.boxShadow = "0 0 15px rgba(0,243,255,0.15)";
        }}
        onBlur={e => {
          e.target.style.border = "1px solid rgba(0,243,255,0.15)";
          e.target.style.boxShadow = "none";
        }}
      />
      {search && (
        <button onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ─── 1A: Category Filter Chips ────────────────────────────────────────────────

function CategoryChips({ activeCategory, onChange, breakdown }) {
  const unitsByCategory = Object.fromEntries(breakdown.map((c) => [c.id, c.totalUnits]));

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: "rgba(0,243,255,0.5)", fontFamily: "'Orbitron', monospace", fontSize: "0.6rem" }}>
        <Layers size={12} /> Filter Bidang Pengukuran
      </p>
      <div className="flex flex-wrap gap-2">
        {/* Semua */}
        <button
          onClick={() => onChange("all")}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300"
          style={activeCategory === "all" ? {
            background: "rgba(0,243,255,0.12)",
            border: "1px solid rgba(0,243,255,0.4)",
            color: "#00f3ff",
            boxShadow: "0 0 10px rgba(0,243,255,0.2)",
            fontFamily: "'Rajdhani', sans-serif",
          } : {
            background: "rgba(15,20,40,0.6)",
            border: "1px solid rgba(0,243,255,0.1)",
            color: "rgba(148,163,184,0.7)",
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          Semua Bidang
        </button>
        {/* Per kategori */}
        {CATEGORIES.filter((c) => unitsByCategory[c.id] > 0).map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300"
            style={
              activeCategory === cat.id
                ? {
                  color: cat.color, borderColor: cat.color + "66", backgroundColor: cat.color + "22",
                  boxShadow: `0 0 12px ${cat.color}33`, fontFamily: "'Rajdhani', sans-serif"
                }
                : {
                  color: cat.color + "aa", borderColor: cat.color + "22", backgroundColor: cat.color + "0a",
                  fontFamily: "'Rajdhani', sans-serif"
                }
            }
          >
            {cat.label}
            <span className="ml-1.5 opacity-60">({unitsByCategory[cat.id] ?? 0})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Category Summary Bar ─────────────────────────────────────────────────────

function CategorySummaryBar({ breakdown }) {
  const total = breakdown.reduce((s, c) => s + c.totalUnits, 0) || 1;
  return (
    <div className="rounded-xl p-5 cyber-card" style={{ borderColor: "rgba(0,243,255,0.1)" }}>
      <p className="text-sm font-bold mb-3 flex items-center gap-2"
        style={{
          color: "#00f3ff", fontFamily: "'Orbitron', monospace", fontSize: "0.7rem", letterSpacing: "0.05em",
          textShadow: "0 0 10px rgba(0,243,255,0.4)"
        }}>
        <Layers size={15} />
        Ikhtisar Bidang Pengukuran
      </p>
      {/* Stacked volume bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4"
        style={{ border: "1px solid rgba(0,243,255,0.1)" }}>
        {breakdown.map((cat) => (
          <div
            key={cat.id}
            className="transition-all duration-500"
            style={{
              width: `${(cat.totalUnits / total) * 100}%`,
              backgroundColor: cat.color,
              boxShadow: `0 0 8px ${cat.color}80`,
            }}
            title={`${cat.label}: ${cat.totalUnits} unit`}
          />
        ))}
      </div>
      {/* Grid of category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {breakdown.map((cat) => (
          <div
            key={cat.id}
            className="rounded-lg p-3 border transition-all duration-300"
            style={{ borderColor: cat.color + "25", backgroundColor: cat.color + "0a" }}
          >
            <p className="text-xs font-bold" style={{ color: cat.color, fontFamily: "'Rajdhani', sans-serif" }}>
              {cat.label}
            </p>
            <p className="text-lg font-bold text-slate-100 mt-0.5"
              style={{ fontFamily: "'Orbitron', monospace", textShadow: `0 0 8px ${cat.color}40` }}>
              {cat.totalUnits}
            </p>
            <p className="text-xs text-slate-600" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {((cat.totalUnits / total) * 100).toFixed(1)}% · {cat.scopeCount} data
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ data }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setCategory] = useState("all");

  const breakdown = useMemo(() => getCategoryBreakdown(data), [data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (activeCategory !== "all") {
      rows = rows.filter((r) => getCategory(r.nama_alat) === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.nama_alat?.toLowerCase().includes(q) ||
          r.nama_perusahaan?.toLowerCase().includes(q) ||
          r.spesifikasi?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, activeCategory, search]);

  const totalUnits = useMemo(() => getTotalUnits(filtered), [filtered]);
  const uniqueClients = useMemo(() => getUniqueClients(filtered), [filtered]);
  const uniqueScopes = useMemo(() => getUniqueScopes(filtered), [filtered]);
  const topScope = useMemo(() => getTopScope(filtered), [filtered]);
  const expansionMatrix = useMemo(() => getExpansionMatrix(filtered), [filtered]);
  const topScore = expansionMatrix.length > 0 ? expansionMatrix[0].score : 0;
  const topEquipment = useMemo(() => getTopEquipment(filtered, 5), [filtered]);
  const clientList = useMemo(() => getClientConcentration(filtered, 5), [filtered]);

  const kpis = [
    {
      icon: Activity, label: "Total Unit Dikalibrasi", value: totalUnits.toLocaleString("id-ID"),
      sub: `dari ${filtered.length} data`, color: "bg-gradient-to-br from-cyan-900/60 to-cyan-800/40", glowColor: "#00f3ff"
    },
    {
      icon: Users, label: "Klien Unik", value: uniqueClients,
      sub: "Jumlah Perusahaan", color: "bg-gradient-to-br from-violet-900/60 to-violet-800/40", glowColor: "#8b5cf6"
    },
    {
      icon: Layers, label: "Ruang Lingkup", value: uniqueScopes,
      sub: "Jenis Instrumen", color: "bg-gradient-to-br from-indigo-900/60 to-indigo-800/40", glowColor: "#818cf8"
    },
    {
      icon: TrendingUp, label: "Skor Ekspansi Tertinggi", value: `${topScore} / 100`,
      sub: expansionMatrix[0]?.nama_alat ?? "—", color: "bg-gradient-to-br from-emerald-900/60 to-emerald-800/40", glowColor: "#10b981"
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* 1A: Category Domain Overview */}
      <CategorySummaryBar breakdown={breakdown} />

      {/* Filters row */}
      <div className="space-y-3">
        <FilterBar search={search} setSearch={setSearch} />
        <CategoryChips activeCategory={activeCategory} onChange={setCategory} breakdown={breakdown} />
      </div>

      {/* Active filter indicator */}
      {(activeCategory !== "all" || search) && (
        <div className="flex items-center gap-2 text-xs text-slate-400"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          <span>Menampilkan</span>
          <span className="font-semibold text-slate-200">{filtered.length}</span>
          <span>dari</span>
          <span className="font-semibold text-slate-200">{data.length}</span>
          <span>data</span>
          {activeCategory !== "all" && (
            <span className="px-2 py-0.5 rounded-full font-medium" style={{
              color: getCategoryMeta(activeCategory).color,
              backgroundColor: getCategoryMeta(activeCategory).color + "22",
            }}>
              {getCategoryMeta(activeCategory).label}
            </span>
          )}
          <button
            onClick={() => { setSearch(""); setCategory("all"); }}
            className="ml-auto flex items-center gap-1 text-slate-500 hover:text-cyan-300 transition-colors"
          >
            <X size={11} /> Hapus filter
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-10 text-sm rounded-xl cyber-card"
          style={{ color: "rgba(0,243,255,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.7rem" }}>
          Tidak ada data yang sesuai dengan filter yang dipilih.
        </div>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Equipment */}
        <div className="rounded-xl overflow-hidden cyber-card" style={{ borderColor: "rgba(0,243,255,0.12)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,243,255,0.1)" }}>
            <h3 className="text-sm font-bold" style={{
              color: "#00f3ff", fontFamily: "'Orbitron', monospace",
              fontSize: "0.65rem", letterSpacing: "0.05em", textShadow: "0 0 10px rgba(0,243,255,0.4)"
            }}>
              Alat Teratas berdasarkan Volume
            </h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,243,255,0.08)" }}>
                {["Instrumen", "Bidang", "Unit", "Klien"].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 font-bold uppercase tracking-wider
                    ${i === 0 ? "text-left" : i === 1 ? "text-left hidden sm:table-cell" : "text-right"}`}
                    style={{ color: "rgba(0,243,255,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.55rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topEquipment.map((eq, i) => {
                const cat = getCategoryMeta(eq.category);
                return (
                  <tr key={i} className="transition-all duration-200"
                    style={{ borderBottom: "1px solid rgba(0,243,255,0.05)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,243,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-200"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}>{eq.nama_alat}</p>
                      <p className="text-slate-600 truncate max-w-[170px]"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}>{eq.spesifikasi}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                        style={{
                          color: cat.color, borderColor: cat.color + "44", backgroundColor: cat.color + "18",
                          fontFamily: "'Rajdhani', sans-serif"
                        }}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold"
                      style={{
                        color: "#00f3ff", fontFamily: "'Orbitron', monospace",
                        textShadow: "0 0 8px rgba(0,243,255,0.4)"
                      }}>
                      {eq.totalUnits}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300"
                      style={{ fontFamily: "'Orbitron', monospace" }}>
                      {eq.clientCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Clients */}
        <div className="rounded-xl overflow-hidden cyber-card" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <h3 className="text-sm font-bold"
              style={{
                color: "#8b5cf6", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem",
                letterSpacing: "0.05em", textShadow: "0 0 10px rgba(139,92,246,0.4)"
              }}>
              Klien Teratas berdasarkan Volume
            </h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
                {["Perusahaan", "Unit", "Ruang Lingkup", "Pangsa"].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 font-bold uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}
                    style={{ color: "rgba(139,92,246,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.55rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const grandTotal = getTotalUnits(filtered) || 1;
                return clientList.map((c, i) => (
                  <tr key={i} className="transition-all duration-200"
                    style={{ borderBottom: "1px solid rgba(139,92,246,0.05)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3 font-semibold text-slate-200"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {c.nama_perusahaan}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold"
                      style={{
                        color: "#8b5cf6", fontFamily: "'Orbitron', monospace",
                        textShadow: "0 0 8px rgba(139,92,246,0.4)"
                      }}>
                      {c.totalVolume}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300"
                      style={{ fontFamily: "'Orbitron', monospace" }}>
                      {c.instrumentTypes}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 text-xs"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {((c.totalVolume / grandTotal) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
