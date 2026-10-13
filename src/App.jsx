import React, { useState, useCallback } from "react";
import {
  FlaskConical,
  LayoutDashboard,
  BarChart3,
  Lightbulb,
  Upload,
  ChevronRight,
  Zap,
} from "lucide-react";
import Uploader from "./components/Uploader";
import Dashboard from "./components/Dashboard";
import ChartViewer from "./components/ChartViewer";
import RecommendationPanel from "./components/RecommendationPanel";
import { sampleData } from "./utils/sampleData";
import { cleanData } from "./utils/analytics";

const TABS = [
  { id: "upload",          label: "Unggah Data",     icon: Upload },
  { id: "dashboard",       label: "Dasbor",          icon: LayoutDashboard },
  { id: "charts",          label: "Grafik",          icon: BarChart3 },
  { id: "recommendations", label: "Rekomendasi",     icon: Lightbulb },
];

function ErrorBoundary({ children }) {
  const [error, setError] = React.useState(null);
  React.useEffect(() => { setError(null); }, [children]);
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center cyber-card">
        <p className="text-red-400 font-semibold" style={{ fontFamily: "'Orbitron', monospace" }}>
          ⚠ Terjadi kesalahan saat memuat panel ini.
        </p>
        <p className="text-slate-500 text-xs mt-1">{error.message}</p>
        <button onClick={() => setError(null)} className="mt-3 text-xs text-red-300 underline">
          Coba lagi
        </button>
      </div>
    );
  }
  return (
    <React.Suspense fallback={<div className="text-cyan-400/60 text-sm p-4 font-orbitron">Memuat…</div>}>
      <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
    </React.Suspense>
  );
}

class ErrorCatcher extends React.Component {
  componentDidCatch(err) { this.props.onError(err); }
  render() { return this.props.children; }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [data, setData] = useState(null);

  const handleData = useCallback((parsed) => {
    setData(parsed);
    setActiveTab("dashboard");
  }, []);

  const handleSample = useCallback(() => {
    setData(cleanData(sampleData));
    setActiveTab("dashboard");
  }, []);

  const hasData = data && data.length > 0;

  return (
    <div className="min-h-screen text-slate-200 flex flex-col cyber-grid scanlines"
      style={{ background: "linear-gradient(180deg, #05050a 0%, #090d16 50%, #05050a 100%)" }}>

      {/* Background Flares */}
      <div className="bg-flare w-96 h-96 bg-cyan-500/5 top-0 left-1/4 -translate-x-1/2" style={{ position: 'fixed', top: '10%', left: '20%', zIndex: 0 }} />
      <div className="bg-flare w-80 h-80 bg-pink-500/5 top-0 right-1/4"                style={{ position: 'fixed', top: '30%', right: '15%', zIndex: 0, animationDelay: '4s' }} />

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-cyan-500/15 bg-[#05050a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center neon-pulse"
              style={{ background: "linear-gradient(135deg, #ff007f, #8b5cf6, #00f3ff)" }}>
              <FlaskConical size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight font-orbitron tracking-widest glow-text-cyan"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                CalibScope
              </p>
              <p className="text-xs leading-tight hidden sm:block"
                style={{ color: "rgba(0,243,255,0.5)", fontFamily: "'Rajdhani', sans-serif" }}>
                Platform Analisis &amp; Ekspansi Ruang Lingkup
              </p>
            </div>
          </div>

          {/* Tab Nav */}
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const disabled = !hasData && tab.id !== "upload";
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  disabled={disabled}
                  onClick={() => !disabled && setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                    ${isActive
                      ? "border text-cyan-300"
                      : disabled
                      ? "text-slate-700 cursor-not-allowed"
                      : "text-slate-400 hover:text-cyan-300 hover:border hover:border-cyan-500/30"
                    }`}
                  style={isActive ? {
                    background: "rgba(0,243,255,0.08)",
                    border: "1px solid rgba(0,243,255,0.35)",
                    boxShadow: "0 0 12px rgba(0,243,255,0.2)",
                  } : {}}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="border-b border-cyan-500/10 bg-[#090d16]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-1.5 text-xs text-slate-600">
          <Zap size={11} className="text-cyan-500/60" />
          <span style={{ color: "rgba(0,243,255,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>CalibScope</span>
          <ChevronRight size={11} className="text-slate-700" />
          <span className="text-slate-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {TABS.find((t) => t.id === activeTab)?.label}
          </span>
          {hasData && (
            <>
              <ChevronRight size={11} className="text-slate-700" />
              <span style={{ color: "#00f3ff", fontFamily: "'Rajdhani', sans-serif" }}>
                {data.length} data dimuat
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10">
        {activeTab === "upload" && (
          <section>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold leading-tight"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                <span style={{ color: "#00f3ff", textShadow: "0 0 20px rgba(0,243,255,0.5)" }}>
                  Analisis Ruang Lingkup
                </span>
                <br />
                <span style={{ background: "linear-gradient(90deg, #ff007f, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  &amp; Platform Ekspansi Kalibrasi
                </span>
              </h1>
              <p className="mt-3 max-w-xl leading-relaxed"
                style={{ color: "rgba(148,163,184,0.8)", fontFamily: "'Rajdhani', sans-serif", fontSize: "1rem" }}>
                Unggah data pesanan kalibrasi (CSV/XLSX) atau gunakan data contoh untuk menjelajahi dasbor analitik.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Uploader Column */}
              <div className="lg:col-span-2">
                <Uploader onData={handleData} onUseSample={handleSample} />
              </div>

              {/* Info Column */}
              <div className="space-y-4">
                <FeatureCard
                  icon={<LayoutDashboard size={16} style={{ color: "#00f3ff" }} />}
                  title="Dasbor KPI"
                  color="#00f3ff"
                  desc="Total unit, konsentrasi klien, instrumen paling diminati, dan skor peluang ekspansi dalam satu tampilan."
                />
                <FeatureCard
                  icon={<BarChart3 size={16} style={{ color: "#8b5cf6" }} />}
                  title="Grafik Interaktif"
                  color="#8b5cf6"
                  desc="Grafik batang dan donat menampilkan distribusi permintaan instrumen dan pangsa klien."
                />
                <FeatureCard
                  icon={<Lightbulb size={16} style={{ color: "#10b981" }} />}
                  title="Rekomendasi Ekspansi"
                  color="#10b981"
                  desc="Kandidat ruang lingkup berdasarkan skor AI dengan saran standar acuan untuk akreditasi KAN / ISO 17025. Ekspor PDF atau CSV."
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "dashboard" && hasData && (
          <section>
            <SectionHeader title="Dasbor Analitik" sub="Ringkasan KPI dan tabel data terfilter" />
            <Dashboard data={data} />
          </section>
        )}

        {activeTab === "charts" && hasData && (
          <section>
            <SectionHeader title="Penampil Grafik" sub="Visualisasi volume kalibrasi dan distribusi instrumen" />
            <ChartViewer data={data} />
          </section>
        )}

        {activeTab === "recommendations" && hasData && (
          <section>
            <SectionHeader title="Rekomendasi Ekspansi Ruang Lingkup" sub="Daftar prioritas untuk perencanaan akreditasi KAN / ISO 17025" />
            <RecommendationPanel data={data} />
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-cyan-500/10 py-5 text-center relative z-10">
        <hr className="neon-divider mb-4" />
        <p className="text-xs" style={{ color: "rgba(0,243,255,0.3)", fontFamily: "'Orbitron', monospace", letterSpacing: "0.1em" }}>
          CalibScope © {new Date().getFullYear()} · Platform Analisis &amp; Ekspansi Ruang Lingkup Kalibrasi · Dibangun dengan React + Vite
        </p>
      </footer>
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-7">
      <h1 className="text-xl font-bold" style={{ fontFamily: "'Orbitron', monospace", color: "#00f3ff", textShadow: "0 0 15px rgba(0,243,255,0.4)" }}>
        {title}
      </h1>
      <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>{sub}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="cyber-card p-4 rounded-xl" style={{ borderColor: `${color}22` }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-semibold" style={{ color, fontFamily: "'Orbitron', monospace", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
          {title}
        </p>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem" }}>
        {desc}
      </p>
    </div>
  );
}
