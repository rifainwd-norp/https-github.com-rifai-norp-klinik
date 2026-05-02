"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, CheckCircle2, XCircle, AlertCircle, 
  Loader2, Play, Sparkles, ArrowRight
} from "lucide-react";
import Link from "next/link";

type StepResult = {
  step: string;
  status: "ok" | "warning" | "error";
  error?: string;
};

const MIGRATION_STEPS = [
  "Update profiles data structure",
  "Create services catalog",
  "Create specialists management",
  "Create appointments engine",
  "Create invoices & payment system",
  "Create inventory tracking",
  "Create service-material relations",
  "Create inventory usage logs",
  "Function: Loyalty points system",
  "Function: Therapist rating engine",
  "Function: Auto-inventory deduction",
  "Database Security (RLS)",
  "Seed: 14 Initial Services",
  "Seed: Clinical Supply Inventory",
];

export default function SetupPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResults([]);
    setErrorMsg(null);
    setDone(false);

    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const json = await res.json();

      if (!res.ok || json.error) {
        setErrorMsg(json.error || "Terjadi kesalahan pada server.");
      } else {
        setResults(json.results || []);
        setDone(true);
      }
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server. Pastikan dev server berjalan.");
    } finally {
      setIsRunning(false);
    }
  };

  const successCount = results.filter(r => r.status === "ok").length;
  const warningCount = results.filter(r => r.status === "warning").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <Database size={40} />
          </div>
          <h1 className="font-serif text-4xl text-on-surface mb-3">Database Migration</h1>
          <p className="text-on-surface-variant font-medium">
            Sinkronisasi database Supabase dengan seluruh spesifikasi sistem klinik.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] border border-outline-variant shadow-sm p-10"
        >
          {/* Pre-run state */}
          {!isRunning && !done && !errorMsg && (
            <div className="space-y-6">
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-1">Prasyarat: Service Role Key</p>
                  <p className="text-xs text-amber-700">
                    Isi <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> di <code className="bg-amber-100 px-1 rounded">.env.local</code> dahulu.
                    Ambil dari: <strong>Supabase Dashboard → Settings → API → service_role</strong>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                  {MIGRATION_STEPS.length} langkah yang akan dijalankan:
                </p>
                <ul className="space-y-2">
                  {MIGRATION_STEPS.map((step, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="w-5 h-5 rounded-full bg-surface-variant/30 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={runMigration}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play size={18} /> Jalankan Migration
              </button>
            </div>
          )}

          {/* Loading state */}
          {isRunning && (
            <div className="text-center py-12 space-y-6">
              <Loader2 className="animate-spin text-primary mx-auto" size={48} />
              <div>
                <p className="font-serif text-2xl text-on-surface mb-2">Menjalankan Migration...</p>
                <p className="text-sm text-on-surface-variant">Harap tunggu, jangan tutup halaman ini.</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {errorMsg && (
            <div className="space-y-6">
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
                <XCircle size={24} className="text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-red-700 mb-1">Migration Gagal</p>
                  <p className="text-sm text-red-600">{errorMsg}</p>
                </div>
              </div>
              <button 
                onClick={() => { setErrorMsg(null); }}
                className="w-full py-4 rounded-2xl border border-outline-variant text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Results state */}
          <AnimatePresence>
            {done && results.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-2xl text-center border border-green-100">
                    <p className="text-2xl font-serif text-green-600">{successCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Berhasil</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl text-center border border-amber-100">
                    <p className="text-2xl font-serif text-amber-600">{warningCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Peringatan</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl text-center border border-red-100">
                    <p className="text-2xl font-serif text-red-500">{errorCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Error</p>
                  </div>
                </div>

                {/* Step results */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {results.map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-xs ${
                      r.status === "ok" ? "bg-green-50" : 
                      r.status === "warning" ? "bg-amber-50" : "bg-red-50"
                    }`}>
                      {r.status === "ok" && <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />}
                      {r.status === "warning" && <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />}
                      {r.status === "error" && <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold text-on-surface">{MIGRATION_STEPS[i] || r.step}</p>
                        {r.error && <p className="text-on-surface-variant mt-0.5 italic">{r.error}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {errorCount === 0 ? (
                  <Link 
                    href="/admin"
                    className="w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Sparkles size={18} /> Buka Admin Dashboard <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700">
                    <p className="font-bold mb-1">Ada langkah yang gagal.</p>
                    <p>Kemungkinan tabel sudah ada atau RLS policy sudah terpasang — ini normal jika migration sudah pernah dijalankan sebelumnya.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
