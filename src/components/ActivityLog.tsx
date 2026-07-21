"use client";

import { useEffect, useState } from "react";
import { History, Zap, Recycle, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ActivityEntry } from "./BankSampahCalculator";

interface ActivityLogProps {
  /** All entries — component will filter by activeTab internally */
  entries: ActivityEntry[];
  activeTab: "plts" | "bank-sampah";
  onClear: () => void;
}

function Badge({ type }: { type: "sampah" | "energi" }) {
  if (type === "energi") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#003E87]/10 text-[#003E87]">
        <Zap className="w-2.5 h-2.5" strokeWidth={2.5} />
        Energi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FED501]/20 text-[#9A7F00]">
      <Recycle className="w-2.5 h-2.5" strokeWidth={2.5} />
      Sampah
    </span>
  );
}

function RelativeTime({ timestamp }: { timestamp: Date }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () =>
      setLabel(
        formatDistanceToNow(new Date(timestamp), {
          addSuffix: true,
          locale: idLocale,
        })
      );
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className="flex items-center gap-1 text-[10px] text-[#6B7280] whitespace-nowrap">
      <Clock className="w-3 h-3" strokeWidth={2} />
      {label}
    </span>
  );
}

export default function ActivityLog({ entries, activeTab, onClear }: ActivityLogProps) {
  // Filter entries by context: PLTS tab shows energy logs, Bank Sampah tab shows sampah logs
  const filtered = entries.filter((e) =>
    activeTab === "plts" ? e.type === "energi" : e.type === "sampah"
  );

  const sectionLabel =
    activeTab === "plts" ? "Log Milestone Energi" : "Log Setoran Sampah";
  const sectionSub =
    activeTab === "plts"
      ? "Riwayat pencapaian dan anomali PLTS"
      : "Riwayat penyetoran & konversi saldo bank sampah";
  const emptyText =
    activeTab === "plts"
      ? "Belum ada log energi tercatat. Sistem akan otomatis mencatat milestone daya dan pengisian baterai."
      : "Belum ada setoran tercatat. Gunakan kalkulator di atas untuk mulai menyetor sampah.";

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8"
      aria-label="Activity Log"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "plts" ? "bg-[#003E87]" : "bg-[#FED501]"
            }`}
          >
            {activeTab === "plts" ? (
              <History className="w-4 h-4 text-white" strokeWidth={2} />
            ) : (
              <History className="w-4 h-4 text-black" strokeWidth={2} />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#000000]">{sectionLabel}</h2>
            <p className="text-xs text-[#6B7280]">{sectionSub}</p>
          </div>
        </div>
        {filtered.length > 0 && (
          <button
            id="clear-log-button"
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            Hapus Semua
          </button>
        )}
      </div>

      {/* Log card */}
      <div className="card overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-black/4 flex items-center justify-center mb-4">
                <History className="w-10 h-10 text-[#D1D5DB]" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-[#000000] mb-1">
                Belum ada aktivitas tercatat
              </h3>
              <p className="text-sm text-[#6B7280] max-w-xs">{emptyText}</p>
            </motion.div>
          ) : (
            <div key="list">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[auto,1fr,auto,auto] gap-4 px-6 py-3 border-b border-black/5 bg-black/2">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Tipe</span>
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Deskripsi</span>
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Nilai</span>
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Waktu</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-black/4">
                {filtered.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="grid sm:grid-cols-[auto,1fr,auto,auto] gap-2 sm:gap-4 px-6 py-4 hover:bg-black/2 transition-colors items-center"
                  >
                    <div>
                      <Badge type={entry.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#000000] truncate">{entry.description}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          entry.type === "sampah" ? "text-[#003E87]" : "text-green-600"
                        }`}
                      >
                        {entry.value}
                      </span>
                    </div>
                    <div className="text-right">
                      <RelativeTime timestamp={entry.timestamp} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
