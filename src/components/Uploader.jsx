import React, { useCallback, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, FlaskConical, Zap } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cleanData } from "../utils/analytics";

const ACCEPTED = [".csv", ".xlsx", ".xls"];

export default function Uploader({ onData, onUseSample }) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const processFile = useCallback(
    (file) => {
      if (!file) return;
      const ext = file.name.split(".").pop().toLowerCase();
      setFileName(file.name);
      setStatus(null);
      setErrorMsg("");

      if (ext === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            try {
              const cleaned = cleanData(result.data);
              if (cleaned.length === 0) throw new Error("Tidak ada baris data valid yang ditemukan setelah pembersihan.");
              onData(cleaned);
              setStatus("success");
            } catch (e) {
              setStatus("error");
              setErrorMsg(e.message);
            }
          },
          error: (err) => {
            setStatus("error");
            setErrorMsg(err.message);
          },
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            const cleaned = cleanData(rows);
            if (cleaned.length === 0) throw new Error("Tidak ada baris data valid yang ditemukan setelah pembersihan.");
            onData(cleaned);
            setStatus("success");
          } catch (err) {
            setStatus("error");
            setErrorMsg(err.message);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        setStatus("error");
        setErrorMsg("Format file tidak didukung. Silakan unggah CSV atau XLSX.");
      }
    },
    [onData]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile]
  );

  const onFileChange = (e) => processFile(e.target.files[0]);

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="relative flex flex-col items-center justify-center gap-4 p-10 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer"
        style={dragging ? {
          borderColor: "rgba(0,243,255,0.7)",
          background: "rgba(0,243,255,0.05)",
          boxShadow: "0 0 30px rgba(0,243,255,0.15), inset 0 0 30px rgba(0,243,255,0.05)",
          transform: "scale(1.01)",
        } : {
          borderColor: "rgba(0,243,255,0.2)",
          background: "rgba(5,5,10,0.7)",
        }}
        onClick={() => document.getElementById("file-input").click()}
        onMouseEnter={e => {
          if (!dragging) {
            e.currentTarget.style.borderColor = "rgba(0,243,255,0.4)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0,243,255,0.08)";
          }
        }}
        onMouseLeave={e => {
          if (!dragging) {
            e.currentTarget.style.borderColor = "rgba(0,243,255,0.2)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <div className="p-4 rounded-full transition-all duration-300"
          style={dragging ? {
            background: "rgba(0,243,255,0.15)",
            boxShadow: "0 0 20px rgba(0,243,255,0.4)",
          } : {
            background: "rgba(15,20,40,0.8)",
            border: "1px solid rgba(0,243,255,0.15)",
          }}>
          <UploadCloud
            size={40}
            style={{ color: dragging ? "#00f3ff" : "rgba(148,163,184,0.5)",
              filter: dragging ? "drop-shadow(0 0 8px rgba(0,243,255,0.8))" : "none" }}
          />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: dragging ? "#00f3ff" : "#e2e8f0",
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>
            Seret &amp; lepas berkas Anda di sini
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>
            Mendukung <span style={{ color: "#00f3ff", fontWeight: 600 }}>CSV</span> dan{" "}
            <span style={{ color: "#10b981", fontWeight: 600 }}>XLSX / XLS</span>
          </p>
        </div>
        <button
          type="button"
          className="btn-neon px-6 py-2.5 rounded-lg text-sm"
          onClick={(e) => { e.stopPropagation(); document.getElementById("file-input").click(); }}
        >
          <Zap size={14} className="inline mr-1.5" /> Pilih Berkas
        </button>
        <input
          id="file-input"
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Status */}
      {status === "success" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
            boxShadow: "0 0 15px rgba(16,185,129,0.1)" }}>
          <CheckCircle2 size={20} style={{ color: "#10b981" }} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#10b981", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
              Berkas berhasil dimuat
            </p>
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>
              <FileSpreadsheet size={12} /> {fileName}
            </p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            boxShadow: "0 0 15px rgba(239,68,68,0.1)" }}>
          <XCircle size={20} style={{ color: "#f87171" }} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f87171", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem" }}>
              Unggah gagal
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,243,255,0.2), transparent)" }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,243,255,0.4)", fontFamily: "'Orbitron', monospace", fontSize: "0.55rem" }}>atau</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,243,255,0.2), transparent)" }} />
      </div>

      {/* Use Sample Data */}
      <button
        onClick={onUseSample}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300"
        style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)",
          color: "rgba(167,139,250,0.9)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(139,92,246,0.15)";
          e.currentTarget.style.borderColor = "rgba(139,92,246,0.55)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.2)";
          e.currentTarget.style.color = "#c4b5fd";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(139,92,246,0.08)";
          e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.color = "rgba(167,139,250,0.9)";
        }}
      >
        <FlaskConical size={18} />
        Gunakan Data Kalibrasi Contoh (Demo)
      </button>

      {/* Column Hint */}
      <div className="rounded-xl p-4 cyber-card" style={{ borderColor: "rgba(0,243,255,0.1)" }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: "rgba(0,243,255,0.5)", fontFamily: "'Orbitron', monospace", fontSize: "0.58rem" }}>
          Kolom yang Diperlukan
        </p>
        <div className="flex flex-wrap gap-2">
          {["no *", "no_pesanan *", "nama_perusahaan", "nama_alat", "spesifikasi", "jumlah"].map((col) => (
            <span
              key={col}
              className={`px-2 py-1 rounded-md text-xs font-mono ${
                col.endsWith("*")
                  ? "line-through"
                  : ""
              }`}
              style={col.endsWith("*") ? {
                background: "rgba(15,20,40,0.6)",
                color: "rgba(71,85,105,0.7)",
                border: "1px solid rgba(71,85,105,0.2)",
              } : {
                background: "rgba(0,243,255,0.06)",
                color: "#00f3ff",
                border: "1px solid rgba(0,243,255,0.2)",
                boxShadow: "0 0 8px rgba(0,243,255,0.1)",
              }}
            >
              {col.replace(" *", "")}
            </span>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: "rgba(71,85,105,0.8)", fontFamily: "'Rajdhani', sans-serif" }}>
          * Kolom yang dicoret tidak diikutsertakan dalam analisis.
        </p>
      </div>
    </div>
  );
}
