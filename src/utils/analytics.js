/**
 * Data Analytics utilities for Calibration Scope Analysis Platform
 * Data columns available: nama_perusahaan, nama_alat, spesifikasi, jumlah
 */

// ─── Data Cleaning ────────────────────────────────────────────────────────────

export function cleanData(rawRows) {
  if (!Array.isArray(rawRows)) return [];
  return rawRows
    .map((row) => {
      const { no, no_pesanan, ...rest } = row; // eslint-disable-line no-unused-vars
      const cleaned = {};
      for (const [k, v] of Object.entries(rest)) {
        cleaned[k.trim()] = typeof v === "string" ? v.trim() : v;
      }
      cleaned.jumlah = parseInt(cleaned.jumlah, 10) || 0;
      return cleaned;
    })
    .filter(
      (r) =>
        r.nama_alat &&
        r.nama_alat !== "" &&
        r.nama_perusahaan &&
        r.nama_perusahaan !== ""
    );
}

// ─── 1A: Instrument Category Taxonomy ────────────────────────────────────────
// Keyword-based auto-classification into 8 measurement domains.
// Works purely from nama_alat string — no extra data column needed.

export const CATEGORIES = [
  { id: "pressure",    label: "Tekanan",          color: "#00f3ff", emoji: "🔵" },
  { id: "thermal",     label: "Termal",           color: "#fb923c", emoji: "🔴" },
  { id: "electrical",  label: "Kelistrikan",      color: "#facc15", emoji: "🟡" },
  { id: "dimensional", label: "Dimensi",          color: "#34d399", emoji: "🟢" },
  { id: "mass",        label: "Massa & Volume",   color: "#a78bfa", emoji: "🟣" },
  { id: "mechanical",  label: "Mekanik",          color: "#f472b6", emoji: "🌸" },
  { id: "flow",        label: "Aliran",           color: "#2dd4bf", emoji: "🩵" },
  { id: "environment", label: "Lingkungan",       color: "#94a3b8", emoji: "⚪" },
];

const CATEGORY_RULES = [
  { id: "pressure",    keywords: ["pressure gauge", "pressure transmitter", "manometer", "barometer", "vacuum gauge", "pressure"] },
  { id: "thermal",     keywords: ["thermocouple", "thermometer", "temperature", "thermal", "pyrometer", "data logger", "rtd", "heat"] },
  { id: "electrical",  keywords: ["multimeter", "clamp meter", "insulation", "oscilloscope", "power meter", "voltage", "ammeter", "wattmeter", "megger", "lcr", "hipot", "electr"] },
  { id: "dimensional", keywords: ["caliper", "micrometer", "height gauge", "depth gauge", "ruler", "tape", "gauge block", "dial indicator", "coordinate", "roundness", "roughness", "thickness"] },
  { id: "mass",        keywords: ["balance", "scale", "weight", "volumetric flask", "burette", "pipette", "graduated", "mass", "density"] },
  { id: "mechanical",  keywords: ["torque wrench", "torque", "force gauge", "spring balance", "hardness", "tensile", "vibration", "tachometer", "rpm", "spring"] },
  { id: "flow",        keywords: ["flow meter", "flow", "anemometer", "pitot"] },
  { id: "environment", keywords: ["sound level", "noise", "lux meter", "light meter", "radiation", "hygrometer", "humidity", "ph meter", "dissolved"] },
];

/** Classify a single nama_alat string into a category id */
export function getCategory(nama_alat) {
  const lower = (nama_alat || "").toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.id;
  }
  return "environment"; // fallback to Environmental/Other
}

/** Get category metadata object */
export function getCategoryMeta(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Aggregate total jumlah and scope count per category.
 * Returns array sorted by totalUnits desc, usable in charts.
 */
export function getCategoryBreakdown(data) {
  const map = new Map();
  for (const cat of CATEGORIES) {
    map.set(cat.id, { ...cat, totalUnits: 0, scopeCount: 0, clientSet: new Set() });
  }
  for (const r of data) {
    const catId = getCategory(r.nama_alat);
    const entry = map.get(catId);
    if (entry) {
      entry.totalUnits += r.jumlah;
      entry.scopeCount += 1;
      entry.clientSet.add(r.nama_perusahaan);
    }
  }
  return Array.from(map.values())
    .filter((c) => c.totalUnits > 0)
    .map((c) => ({ ...c, clientCount: c.clientSet.size, clientSet: undefined }))
    .sort((a, b) => b.totalUnits - a.totalUnits);
}

// ─── KPI Aggregations ────────────────────────────────────────────────────────

export function getTotalUnits(data) {
  return data.reduce((sum, r) => sum + r.jumlah, 0);
}

export function getUniqueClients(data) {
  return new Set(data.map((r) => r.nama_perusahaan)).size;
}

export function getUniqueScopes(data) {
  return new Set(data.map((r) => r.nama_alat)).size;
}

// ─── Top Equipment ────────────────────────────────────────────────────────────

export function getTopEquipment(data, limit = 10) {
  const map = new Map();
  for (const r of data) {
    const key = `${r.nama_alat}||${r.spesifikasi || ""}`;
    const existing = map.get(key) || {
      nama_alat: r.nama_alat,
      spesifikasi: r.spesifikasi || "—",
      category: getCategory(r.nama_alat),
      totalUnits: 0,
      clientCount: new Set(),
    };
    existing.totalUnits += r.jumlah;
    existing.clientCount.add(r.nama_perusahaan);
    map.set(key, existing);
  }
  return Array.from(map.values())
    .map((e) => ({ ...e, clientCount: e.clientCount.size }))
    .sort((a, b) => b.totalUnits - a.totalUnits)
    .slice(0, limit);
}

export function getTopScope(data) {
  const top = getTopEquipment(data, 1);
  return top.length > 0 ? `${top[0].nama_alat} (${top[0].spesifikasi})` : "—";
}

// ─── Client Concentration ─────────────────────────────────────────────────────

export function getClientConcentration(data, limit = 10) {
  const map = new Map();
  for (const r of data) {
    const c = map.get(r.nama_perusahaan) || {
      nama_perusahaan: r.nama_perusahaan,
      totalVolume: 0,
      instruments: new Set(),
    };
    c.totalVolume += r.jumlah;
    c.instruments.add(r.nama_alat);
    map.set(r.nama_perusahaan, c);
  }
  return Array.from(map.values())
    .map((c) => ({ ...c, instrumentTypes: c.instruments.size, instruments: undefined }))
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, limit);
}

// ─── Equipment Distribution (for pie chart) ───────────────────────────────────

export function getEquipmentDistribution(data) {
  const map = new Map();
  for (const r of data) {
    map.set(r.nama_alat, (map.get(r.nama_alat) || 0) + r.jumlah);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── 1B: HHI Client Concentration Risk ───────────────────────────────────────
/**
 * Herfindahl-Hirschman Index per instrument scope.
 *   HHI = Σ (client_share²)  where share = client_units / scope_total_units
 *   Range: 0 (perfectly distributed) → 1 (single client monopoly)
 *
 * Risk thresholds:
 *   < 0.15  → Low (diversified)
 *   0.15–0.25 → Moderate
 *   0.25–0.40 → High
 *   > 0.40  → Critical (single-client dependency)
 */
export function getHHIRisk(hhi) {
  if (hhi < 0.15) return { level: "Rendah",   cls: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", desc: "Terdiversifikasi dengan baik di antara banyak klien" };
  if (hhi < 0.25) return { level: "Sedang",   cls: "text-yellow-400",  bg: "bg-yellow-500/15 border-yellow-500/30",  desc: "Terdapat konsentrasi klien yang perlu dipantau" };
  if (hhi < 0.40) return { level: "Tinggi",   cls: "text-orange-400",  bg: "bg-orange-500/15 border-orange-500/30",  desc: "Risiko ketergantungan klien yang tinggi" };
  return              { level: "Kritis",    cls: "text-red-400",    bg: "bg-red-500/15 border-red-500/30",        desc: "Ketergantungan pada satu klien — ekspansi berisiko tinggi" };
}

// ─── 1C: Expansion Matrix with Custom Weights ─────────────────────────────────
/**
 * @param {object[]} data - cleaned rows
 * @param {object} weights - { volume: number, diversity: number, demand: number }
 *   Values are raw; they are normalised internally so they don't need to sum to 100.
 *   Default: { volume: 40, diversity: 35, demand: 25 }
 */
export function getExpansionMatrix(data, weights = { volume: 40, diversity: 35, demand: 25 }) {
  // Normalise weights so they always sum to 100
  const wTotal = (weights.volume || 0) + (weights.diversity || 0) + (weights.demand || 0) || 100;
  const wV = (weights.volume   / wTotal) * 100;
  const wD = (weights.diversity / wTotal) * 100;
  const wM = (weights.demand    / wTotal) * 100;

  // Aggregate per nama_alat, tracking per-client units for HHI
  const map = new Map();
  for (const r of data) {
    const key = r.nama_alat;
    const existing = map.get(key) || {
      nama_alat: key,
      totalUnits: 0,
      clients: new Set(),
      clientUnits: new Map(),   // client → units (for HHI)
      rowCount: 0,
    };
    existing.totalUnits += r.jumlah;
    existing.clients.add(r.nama_perusahaan);
    existing.clientUnits.set(
      r.nama_perusahaan,
      (existing.clientUnits.get(r.nama_perusahaan) || 0) + r.jumlah
    );
    existing.rowCount += 1;
    map.set(key, existing);
  }

  const entries = Array.from(map.values());
  const maxUnits   = Math.max(...entries.map((e) => e.totalUnits), 1);
  const maxClients = Math.max(...entries.map((e) => e.clients.size), 1);
  const maxRows    = Math.max(...entries.map((e) => e.rowCount), 1);

  return entries
    .map((e) => {
      // Expansion score
      const volumeScore    = (e.totalUnits    / maxUnits)   * wV;
      const diversityScore = (e.clients.size  / maxClients) * wD;
      const demandScore    = (e.rowCount      / maxRows)    * wM;
      const score = Math.round(volumeScore + diversityScore + demandScore);

      // HHI
      const hhi = e.totalUnits > 0
        ? Array.from(e.clientUnits.values()).reduce(
            (sum, u) => sum + Math.pow(u / e.totalUnits, 2),
            0
          )
        : 0;

      // Score sub-components (for weight breakdown display)
      const scoreBreakdown = {
        volume:    Math.round(volumeScore),
        diversity: Math.round(diversityScore),
        demand:    Math.round(demandScore),
      };

      return {
        nama_alat: e.nama_alat,
        category: getCategory(e.nama_alat),
        totalUnits: e.totalUnits,
        clientCount: e.clients.size,
        rowCount: e.rowCount,
        score,
        scoreBreakdown,
        hhi: Math.round(hhi * 100) / 100,        // rounded to 2 dp
        hhiRisk: getHHIRisk(hhi),
        topClient: [...e.clientUnits.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
        topClientShare: e.totalUnits > 0
          ? Math.round(([...e.clientUnits.values()].sort((a, b) => b - a)[0] / e.totalUnits) * 100)
          : 0,
        referenceStandard: getReferenceStandard(e.nama_alat),
        accreditationNote: getAccreditationNote(e.nama_alat),
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── Reference Standard Lookup ────────────────────────────────────────────────

const REFERENCE_STANDARDS = {
  "Pressure Gauge":              { standard: "Dead Weight Tester / Digital Reference Pressure Gauge", note: "Masuk ruang lingkup KAN bidang Tekanan" },
  "Pressure Transmitter":        { standard: "Digital Reference Pressure Gauge (0.025% FS)", note: "Masuk ruang lingkup KAN bidang Tekanan" },
  "Digital Multimeter":          { standard: "Precision Multifunction Calibrator (Fluke 5520A / Wavetek)", note: "Ruang lingkup KAN bidang Kelistrikan" },
  "Clamp Meter":                 { standard: "AC/DC Current Source & Voltage Standard", note: "Ruang lingkup KAN bidang Kelistrikan" },
  "Insulation Resistance Tester":{ standard: "High Voltage Source & Standard Resistance Decade Box", note: "Ruang lingkup KAN bidang Kelistrikan" },
  "Thermocouple":                { standard: "Temperature Calibration Block / Dry-well Calibrator", note: "Ruang lingkup KAN bidang Temperatur" },
  "Digital Thermometer":         { standard: "Reference Platinum Resistance Thermometer (SPRT)", note: "Ruang lingkup KAN bidang Temperatur" },
  "Temperature Data Logger":     { standard: "Dry-well Calibrator + Reference SPRT", note: "Ruang lingkup KAN bidang Temperatur" },
  "Caliper":                     { standard: "Gauge Block Set (Grade 1), Calibration Reference Ruler", note: "Ruang lingkup KAN bidang Dimensi" },
  "Micrometer":                  { standard: "Gauge Block Set (Grade 1) + Laser Interferometer", note: "Ruang lingkup KAN bidang Dimensi" },
  "Height Gauge":                { standard: "Gauge Block Set + Surface Plate Grade A", note: "Ruang lingkup KAN bidang Dimensi" },
  "Torque Wrench":               { standard: "Reference Torque Transducer + Torque Calibration System", note: "Ruang lingkup KAN bidang Mekanik" },
  "Force Gauge":                 { standard: "Deadweight Force Standard Machine / Load Cell Reference", note: "Ruang lingkup KAN bidang Mekanik" },
  "Analytical Balance":          { standard: "OIML E2 / F1 Class Reference Weights", note: "Ruang lingkup KAN bidang Massa" },
  "Precision Balance":           { standard: "OIML F1 / F2 Class Reference Weights", note: "Ruang lingkup KAN bidang Massa" },
  "Volumetric Flask":            { standard: "Gravimetric Method + Analytical Balance E2 Weights", note: "Ruang lingkup KAN bidang Volume" },
  "Burette":                     { standard: "Gravimetric Method + Analytical Balance E2 Weights", note: "Ruang lingkup KAN bidang Volume" },
  "Flow Meter":                  { standard: "Master Flow Meter / Gravimetric Flow Standard", note: "Ruang lingkup KAN bidang Aliran" },
  "Hygrometer":                  { standard: "Humidity Generator / Dew Point Mirror Standard", note: "Ruang lingkup KAN bidang Kelembaban" },
  "Sound Level Meter":           { standard: "Reference Microphone + Pistonphone Calibrator", note: "Ruang lingkup KAN bidang Akustik" },
  "Vibration Meter":             { standard: "Vibration Reference Transducer + Shaker System", note: "Ruang lingkup KAN bidang Getaran" },
};

function getReferenceStandard(nama_alat) {
  const entry = REFERENCE_STANDARDS[nama_alat];
  return entry ? entry.standard : "Konsultasikan ke tim metrologi / KAN";
}

function getAccreditationNote(nama_alat) {
  const entry = REFERENCE_STANDARDS[nama_alat];
  return entry ? entry.note : "Perlu kajian ruang lingkup lebih lanjut";
}
