"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BankSampahCalculator, { ActivityEntry } from "@/components/BankSampahCalculator";
import ActivityLog from "@/components/ActivityLog";
import WasteSummaryCards from "@/components/WasteSummaryCards";
import KeuanganTransparansi from "@/components/KeuanganTransparansi";
import SalesChart from "@/components/SalesChart";
import IotPLTSMonitor from "@/components/IotPLTSMonitor";
import { motion, AnimatePresence } from "framer-motion";

// ── Seed energy milestone entries (shown on first load for PLTS tab) ──
const SEED_ENTRIES: ActivityEntry[] = [
  {
    id: "seed-1",
    type: "energi",
    description: "Baterai mencapai 100% kapasitas penuh",
    value: "4.45 kW",
    timestamp: new Date(Date.now() - 1000 * 60 * 47),
  },
  {
    id: "seed-2",
    type: "energi",
    description: "Produksi harian mencapai 10 kWh milestone",
    value: "+10 kWh",
    timestamp: new Date(Date.now() - 1000 * 60 * 130),
  },
  {
    id: "seed-3",
    type: "energi",
    description: "Sistem PLTS mulai beroperasi pagi ini",
    value: "0.8 kW",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
];

interface SummaryData {
  perType: { waste_type_name: string; total_kg: number; total_buy_value: number; transaction_count: number }[];
  totals: { total_kg: number; total_buy_value: number; transaction_count: number; total_surplus: number };
  kas_balance: number;
  pending: {
    id: number; waste_type_name: string; weight_kg: number;
    buy_price_per_kg: number; sell_price_per_kg: number;
    total_buy_value: number; created_at: string;
  }[];
  kasHistory: {
    id: number; type: "pemasukan" | "pengeluaran"; amount: number;
    description: string; balance_after: number; created_at: string;
    waste_type_name?: string; weight_kg?: number;
  }[];
}

type ActiveTab = "plts" | "bank-sampah";
type Role = "plts" | "bank_sampah" | "admin";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [roleLoading, setRoleLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("plts");
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  // Fetch current user role
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.role) { router.push("/login"); return; }
        const r = data.role as Role;
        setRole(r);
        // Auto-set tab based on role
        if (r === "plts") setActiveTab("plts");
        else if (r === "bank_sampah") setActiveTab("bank-sampah");
        else setActiveTab("plts"); // admin default
      })
      .catch(() => router.push("/login"))
      .finally(() => setRoleLoading(false));
  }, [router]);

  // Load PLTS from localStorage on mount; seed energi entries if empty
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("plts-activity-log") ?? "[]"
      ) as ActivityEntry[];
      setActivityEntries(stored.length > 0 ? stored : SEED_ENTRIES);
    } catch {
      setActivityEntries(SEED_ENTRIES);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch("/api/summary");
      const data = await res.json();
      setSummary(data);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch summary when bank-sampah tab is active
  useEffect(() => {
    if (activeTab === "bank-sampah") fetchSummary();
  }, [activeTab, fetchSummary]);

  const handleSetor = useCallback((entry: ActivityEntry) => {
    setActivityEntries((prev) => {
      const next = [entry, ...prev];
      localStorage.setItem("plts-activity-log", JSON.stringify(next.slice(0, 50)));
      return next;
    });
    // Refresh summary + chart after new deposit
    fetchSummary();
    setChartRefreshKey((k) => k + 1);
    // Send push notification to bank_sampah subscribers
    fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "♻️ Setoran Baru Masuk!",
        body: entry.description,
        tag: "setor-sampah",
        url: "/?tab=bank-sampah",
        targetRole: "bank_sampah",
      }),
    }).catch(console.error);
  }, [fetchSummary]);

  const handleClearLog = useCallback(() => {
    setActivityEntries((prev) => {
      const filtered = prev.filter((e) =>
        activeTab === "plts" ? e.type !== "energi" : e.type !== "sampah"
      );
      localStorage.setItem("plts-activity-log", JSON.stringify(filtered));
      return filtered;
    });
  }, [activeTab]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as ActiveTab);
  }, []);

  // Show loading while role is being determined
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001F44] to-[#003E87] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} role={role} />

      {/* Main content */}
      <main className="pt-20 pb-16 min-h-screen bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">

            {/* ════════════════════════════════════════
                TAB: PLTS
            ════════════════════════════════════════ */}
            {activeTab === "plts" && (
              <motion.div
                key="plts"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Hero — compact on mobile */}
                <HeroSection />

                {/* ── IoT Monitoring Section ── */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <div className="h-1 w-8 bg-[#FED501] rounded-full flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[#000000]">
                    Monitoring IoT PLTS
                  </h2>
                  <div className="h-px flex-1 bg-black/6 hidden sm:block" />
                  <span className="text-xs text-[#6B7280] font-medium bg-[#003E87]/8 px-2.5 py-1 rounded-full">
                    5 parameter aktif
                  </span>
                </div>

                {/* IoT 5-parameter monitor */}
                <IotPLTSMonitor />

                {/* Energy Activity Log */}
                <ActivityLog
                  entries={activityEntries}
                  activeTab="plts"
                  onClear={handleClearLog}
                />
              </motion.div>
            )}

            {/* ════════════════════════════════════════
                TAB: BANK SAMPAH
            ════════════════════════════════════════ */}
            {activeTab === "bank-sampah" && (
              <motion.div
                key="bank-sampah"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* ── HERO HEADER ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003E87] via-[#004fa8] to-[#0062d4] p-6 sm:p-8 mb-7 text-white"
                >
                  {/* BG decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-[#FED501]/10 translate-y-1/2" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">♻️</span>
                        <h1 className="text-xl sm:text-2xl font-extrabold">Bank Sampah</h1>
                      </div>
                      <p className="text-white/65 text-sm max-w-sm">
                        Manajemen setoran, kas, dan statistik sampah — KKN-T 40 Kemambang
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 min-w-[240px]">
                      {[
                        { label: "Total Sampah", value: `${(summary?.totals?.total_kg ?? 0).toFixed(1)} kg`, icon: "⚖️" },
                        { label: "Dana Warga", value: `Rp ${((summary?.totals?.total_buy_value ?? 0) / 1000).toFixed(0)}k`, icon: "💵" },
                        { label: "Transaksi", value: `${summary?.totals?.transaction_count ?? 0}×`, icon: "📋" },
                        { label: "Surplus Kas", value: `Rp ${((summary?.totals?.total_surplus ?? 0) / 1000).toFixed(0)}k`, icon: "💰" },
                      ].map((s) => (
                        <div key={s.label} className="bg-white/12 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-white/15">
                          <p className="text-white/60 text-[10px] font-medium">{s.icon} {s.label}</p>
                          <p className="text-white font-bold text-sm mt-0.5">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ── KALKULATOR SETORAN (full width, prominent) ── */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-8 bg-[#FED501] rounded-full" />
                    <h2 className="text-base font-bold text-[#000000]">Setoran Sampah</h2>
                    <div className="h-px flex-1 bg-black/6 hidden sm:block" />
                    <span className="text-xs text-[#6B7280] bg-[#FED501]/15 px-2.5 py-1 rounded-full font-medium">Formulir Setor</span>
                  </div>
                  <BankSampahCalculator
                    onSetor={handleSetor}
                    onTypesChanged={fetchSummary}
                  />
                </div>

                {/* ── STATISTIK VISUAL ── */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-8 bg-[#003E87] rounded-full" />
                    <h2 className="text-base font-bold text-[#000000]">Statistik & Grafik</h2>
                    <div className="h-px flex-1 bg-black/6 hidden sm:block" />
                  </div>

                  {summaryLoading ? (
                    <div className="flex items-center justify-center py-16 card">
                      <div className="w-6 h-6 border-2 border-[#003E87] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <WasteSummaryCards
                        perType={summary?.perType ?? []}
                        totalKg={summary?.totals?.total_kg ?? 0}
                        totalBuyValue={summary?.totals?.total_buy_value ?? 0}
                      />
                      <div className="mt-5">
                        <SalesChart refreshKey={chartRefreshKey} />
                      </div>
                    </>
                  )}
                </div>

                {/* ── TRANSPARANSI KEUANGAN ── */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-8 bg-[#22C55E] rounded-full" />
                    <h2 className="text-base font-bold text-[#000000]">Transparansi Keuangan</h2>
                    <div className="h-px flex-1 bg-black/6 hidden sm:block" />
                    <span className="text-xs text-[#6B7280] bg-[#22C55E]/12 px-2.5 py-1 rounded-full font-medium text-[#15803D]">Kas Real-time</span>
                  </div>
                  {!summaryLoading && summary ? (
                    <KeuanganTransparansi
                      kasBalance={summary.kas_balance}
                      totalSurplus={summary.totals?.total_surplus ?? 0}
                      pending={summary.pending}
                      kasHistory={summary.kasHistory}
                      onSellSuccess={() => { fetchSummary(); setChartRefreshKey((k) => k + 1); }}
                    />
                  ) : (
                    <div className="card flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* ── LOG AKTIVITAS ── */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-[#8B5CF6] rounded-full" />
                  <h2 className="text-base font-bold text-[#000000]">Log Aktivitas Setoran</h2>
                  <div className="h-px flex-1 bg-black/6 hidden sm:block" />
                </div>
                <ActivityLog
                  entries={activityEntries}
                  activeTab="bank-sampah"
                  onClear={handleClearLog}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 flex-wrap">
          <p className="text-[11px] text-[#6B7280] text-center">
            © 2026 KKN-T 40 · DEB Kembara
            <span className="mx-1.5 text-black/20">·</span>
            PLTS &amp; Bank Sampah
            <span className="hidden sm:inline mx-1.5 text-black/20">·</span>
            <span className="hidden sm:inline">v2.0.0</span>
          </p>
        </div>
      </footer>
    </>
  );
}
