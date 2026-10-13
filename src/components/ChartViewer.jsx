import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import {
  getTopEquipment,
  getEquipmentDistribution,
  getCategoryBreakdown,
} from "../utils/analytics";

// ─── Neon Color Palettes ──────────────────────────────────────────────────────

const BAR_COLORS = [
  "#00f3ff","#ff007f","#8b5cf6","#10b981",
  "#f472b6","#818cf8","#34d399","#facc15",
  "#60a5fa","#fb923c",
];
const PIE_COLORS = [
  "#00f3ff","#ff007f","#8b5cf6","#10b981","#f472b6",
  "#818cf8","#34d399","#facc15","#60a5fa","#fb923c",
  "#e879f9","#2dd4bf",
];

// ─── Shared Neon Tooltip ──────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, extraKey }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: "rgba(5,5,10,0.95)",
      border: "1px solid rgba(0,243,255,0.3)",
      borderRadius: "10px",
      padding: "10px 14px",
      boxShadow: "0 0 20px rgba(0,243,255,0.2)",
    }} className="text-xs space-y-1">
      <p className="font-bold" style={{ color: "#00f3ff", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
        {label ?? p.name}
      </p>
      <p style={{ color: "#00f3ff" }}>
        <span style={{ color: "rgba(148,163,184,0.7)", fontFamily: "'Rajdhani', sans-serif" }}>Unit: </span>
        <strong style={{ fontFamily: "'Orbitron', monospace" }}>{p.value}</strong>
      </p>
      {payload[1] && (
        <p style={{ color: "#8b5cf6" }}>
          <span style={{ color: "rgba(148,163,184,0.7)", fontFamily: "'Rajdhani', sans-serif" }}>{extraKey}: </span>
          <strong style={{ fontFamily: "'Orbitron', monospace" }}>{payload[1].value}</strong>
        </p>
      )}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const pct = d.payload?.percent ? `${(d.payload.percent * 100).toFixed(1)}%` : "";
  return (
    <div style={{
      background: "rgba(5,5,10,0.95)",
      border: "1px solid rgba(255,0,127,0.3)",
      borderRadius: "10px",
      padding: "10px 14px",
      boxShadow: "0 0 20px rgba(255,0,127,0.2)",
    }} className="text-xs">
      <p className="font-bold" style={{ color: "#ff007f", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
        {d.name}
      </p>
      <p style={{ color: "#10b981" }} className="mt-1">
        <span style={{ color: "rgba(148,163,184,0.7)", fontFamily: "'Rajdhani', sans-serif" }}>Unit: </span>
        <strong style={{ fontFamily: "'Orbitron', monospace" }}>{d.value}</strong>
      </p>
      <p style={{ color: "rgba(148,163,184,0.5)", fontFamily: "'Rajdhani', sans-serif" }}>{pct}</p>
    </div>
  );
}

// ─── Chart Panel Wrapper ──────────────────────────────────────────────────────

function ChartPanel({ title, sub, children, glowColor = "#00f3ff" }) {
  return (
    <div className="rounded-xl p-6 cyber-card transition-all duration-300"
      style={{ borderColor: `${glowColor}18` }}>
      <h3 className="text-sm font-bold mb-1"
        style={{ color: glowColor, fontFamily: "'Orbitron', monospace", fontSize: "0.65rem",
          letterSpacing: "0.05em", textShadow: `0 0 10px ${glowColor}50` }}>
        {title}
      </h3>
      <p className="text-xs mb-5" style={{ color: "rgba(148,163,184,0.5)", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.82rem" }}>
        {sub}
      </p>
      {children}
    </div>
  );
}

// ─── 1A: Category Radar Chart ─────────────────────────────────────────────────

function CategoryRadar({ breakdown }) {
  const maxUnits = Math.max(...breakdown.map((c) => c.totalUnits), 1);
  const radarData = breakdown.map((c) => ({
    domain: c.label,
    Volume: Math.round((c.totalUnits / maxUnits) * 100),
    Klien: Math.round((c.clientCount / Math.max(...breakdown.map((x) => x.clientCount), 1)) * 100),
  }));

  return (
    <ChartPanel
      title="Radar Domain — Volume vs. Jangkauan Klien"
      sub="Membandingkan volume kalibrasi setiap domain (biru) terhadap jangkauan klien (ungu) — dinormalisasi ke 0–100"
      glowColor="#8b5cf6"
    >
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(0,243,255,0.1)" />
          <PolarAngleAxis dataKey="domain" tick={{ fill: "rgba(148,163,184,0.7)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "rgba(0,243,255,0.3)", fontSize: 9 }} />
          <Radar name="Volume"  dataKey="Volume"  stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.12} strokeWidth={2} />
          <Radar name="Klien"   dataKey="Klien"   stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.10} strokeWidth={2} />
          <Legend formatter={(v) => <span style={{ color: "rgba(148,163,184,0.8)", fontSize: 12, fontFamily: "'Rajdhani', sans-serif" }}>{v}</span>} iconType="circle" iconSize={10} />
          <Tooltip content={<ChartTooltip extraKey="Jangkauan Klien" />} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

// ─── Category Bar Chart ───────────────────────────────────────────────────────

function CategoryBarChart({ breakdown }) {
  const data = breakdown.map((c) => ({
    name: c.label,
    Unit: c.totalUnits,
    Klien: c.clientCount,
    fill: c.color,
  }));

  return (
    <ChartPanel
      title="Volume Kalibrasi per Bidang Pengukuran"
      sub="Total unit yang dikalibrasi dijumlahkan dari semua instrumen pada setiap bidang — berdasarkan klasifikasi kata kunci nama_alat"
      glowColor="#00f3ff"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,243,255,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(148,163,184,0.6)", fontSize: 10, fontFamily: "'Rajdhani', sans-serif" }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "rgba(148,163,184,0.6)", fontSize: 11, fontFamily: "'Orbitron', monospace" }} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,243,255,0.04)" }} />
          <Bar dataKey="Unit" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} style={{ filter: `drop-shadow(0 0 6px ${d.fill}80)` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Mini legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {breakdown.map((c) => {
          const total = breakdown.reduce((s, x) => s + x.totalUnits, 0) || 1;
          return (
            <div key={c.id} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color, boxShadow: `0 0 5px ${c.color}80` }} />
              <span style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>{c.label}</span>
              <span className="font-mono" style={{ color: "rgba(148,163,184,0.9)", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
                {((c.totalUnits / total) * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </ChartPanel>
  );
}

// ─── Top 10 Instruments Bar ───────────────────────────────────────────────────

function InstrumentBarChart({ top10 }) {
  const barData = top10.map((e) => ({
    name: e.nama_alat.length > 20 ? e.nama_alat.slice(0, 18) + "…" : e.nama_alat,
    fullName: e.nama_alat,
    unit: e.totalUnits,
  }));
  return (
    <ChartPanel
      title="10 Instrumen Paling Banyak Dikalibrasi"
      sub="Volume kalibrasi yang diagregasi per jenis instrumen di semua spesifikasi"
      glowColor="#ff007f"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,0,127,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(148,163,184,0.6)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "rgba(148,163,184,0.6)", fontSize: 11, fontFamily: "'Orbitron', monospace" }} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,0,127,0.04)" }} />
          <Bar dataKey="unit" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {barData.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}
                style={{ filter: `drop-shadow(0 0 5px ${BAR_COLORS[i % BAR_COLORS.length]}70)` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ distribution }) {
  return (
    <ChartPanel
      title="Pangsa Alat — Top 12"
      sub="Proporsi total unit yang dikalibrasi per jenis instrumen"
      glowColor="#10b981"
    >
      <ResponsiveContainer width="100%" height={290}>
        <PieChart>
          <Pie
            data={distribution}
            cx="50%" cy="50%"
            innerRadius={70} outerRadius={115}
            paddingAngle={2} dataKey="value"
          >
            {distribution.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}
                stroke="transparent"
                style={{ filter: `drop-shadow(0 0 6px ${PIE_COLORS[i % PIE_COLORS.length]}70)` }} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend formatter={(v) => <span style={{ color: "rgba(148,163,184,0.7)", fontSize: 12, fontFamily: "'Rajdhani', sans-serif" }}>{v}</span>} iconType="circle" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend table */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
        {distribution.map((d, i) => {
          const total = distribution.reduce((s, x) => s + x.value, 0);
          return (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                  boxShadow: `0 0 5px ${PIE_COLORS[i % PIE_COLORS.length]}80` }} />
              <span className="truncate" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>
                {d.name}
              </span>
              <span className="ml-auto shrink-0 font-mono"
                style={{ color: "rgba(148,163,184,0.9)", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
                {((d.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </ChartPanel>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ChartViewer({ data }) {
  const top10        = useMemo(() => getTopEquipment(data, 10), [data]);
  const distribution = useMemo(() => getEquipmentDistribution(data).slice(0, 12), [data]);
  const breakdown    = useMemo(() => getCategoryBreakdown(data), [data]);

  return (
    <div className="space-y-6">
      {/* 1A — Grafik level kategori */}
      <CategoryBarChart breakdown={breakdown} />
      <CategoryRadar    breakdown={breakdown} />

      {/* Grafik level instrumen */}
      <InstrumentBarChart top10={top10} />
      <DonutChart         distribution={distribution} />
    </div>
  );
}
