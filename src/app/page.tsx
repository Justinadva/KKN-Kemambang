"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CurrentPowerCard from "@/components/CurrentPowerCard";
import EnergyBalanceCard from "@/components/EnergyBalanceCard";
import TotalEnergyCard from "@/components/TotalEnergyCard";
import CO2SavingsCard from "@/components/CO2SavingsCard";
import BankSampahCalculator, { ActivityEntry } from "@/components/BankSampahCalculator";
import ActivityLog from "@/components/ActivityLog";
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

type ActiveTab = "plts" | "bank-sampah";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("plts");
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);

  // Load from localStorage on mount; seed energi entries if empty
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

  const handleSetor = useCallback((entry: ActivityEntry) => {
    setActivityEntries((prev) => {
      const next = [entry, ...prev];
      localStorage.setItem("plts-activity-log", JSON.stringify(next.slice(0, 50)));
      return next;
    });
  }, []);

  const handleClearLog = useCallback(() => {
    // Only clear entries matching the current tab context
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

  return (
    <>
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

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
                {/* Hero */}
                <HeroSection />

                {/* Section heading */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-1 w-8 bg-[#FED501] rounded-full" />
                  <h2 className="text-lg font-bold text-[#000000]">Widget Monitoring</h2>
                  <div className="h-px flex-1 bg-black/6" />
                  <span className="text-xs text-[#6B7280] font-medium">4 widget aktif</span>
                </div>

                {/* 4 energy cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <CurrentPowerCard />
                  <EnergyBalanceCard />
                  <TotalEnergyCard />
                  <CO2SavingsCard />
                </div>

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
                {/* Page header — no hero */}
                <div className="mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-1 w-8 bg-[#003E87] rounded-full" />
                    <h1 className="text-2xl font-extrabold text-[#000000]">Bank Sampah</h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-1.5 text-sm text-[#6B7280] ml-11"
                  >
                    Kalkulator setoran sampah dan konversi estimasi saldo anggota KKN-T 40 Kemambang.
                  </motion.p>
                </div>

                {/* Calculator + Summary grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                  {/* Kalkulator */}
                  <BankSampahCalculator onSetor={handleSetor} />

                  {/* Ringkasan card */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }}
                    className="card p-6 flex flex-col gap-5"
                  >
                    <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Ringkasan Bank Sampah
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Setoran",   value: "142 kg",     color: "#003E87" },
                        { label: "Total Saldo",      value: "Rp 487.500", color: "#22C55E" },
                        { label: "Anggota Aktif",    value: "87 orang",   color: "#8B5CF6" },
                        { label: "Kurangi CO₂",     value: "71.2 kg",    color: "#F59E0B" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl p-4"
                          style={{ background: `color-mix(in srgb, ${item.color} 8%, white)` }}
                        >
                          <p className="text-[10px] text-[#6B7280] font-medium mb-1">{item.label}</p>
                          <p className="text-base font-bold" style={{ color: item.color }}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Price guide */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] mb-3">
                        Harga per Kilogram
                      </p>
                      <div className="flex flex-col gap-2">
                        {[
                          { type: "🧴 Plastik",       price: "Rp 3.500/kg" },
                          { type: "📦 Kertas/Kardus",  price: "Rp 2.000/kg" },
                          { type: "⚙️ Logam/Besi",     price: "Rp 8.000/kg" },
                          { type: "🍶 Kaca/Botol",     price: "Rp 1.500/kg" },
                          { type: "🌿 Organik",        price: "Rp 500/kg"   },
                        ].map((item) => (
                          <div
                            key={item.type}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-black/4 last:border-0"
                          >
                            <span className="text-[#000000]">{item.type}</span>
                            <span className="font-bold text-[#003E87]">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Bank Sampah Activity Log */}
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
      <footer className="bg-white border-t border-black/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#6B7280]">
            © 2026 KKN-T 40 Kemambang · DEB Kembara — Dashboard PLTS &amp; Bank Sampah
          </p>
          <p className="text-xs text-[#6B7280]">
            Diperbarui otomatis setiap 5 menit · v1.1.0
          </p>
        </div>
      </footer>
    </>
  );
}
