"use client";

import { useState, useCallback, useEffect } from "react";
import { Recycle, ChevronDown, Plus, CheckCircle, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardCard from "./DashboardCard";
import WasteTypeManager, { WasteType } from "./WasteTypeManager";

export interface ActivityEntry {
  id: string;
  type: "sampah" | "energi";
  description: string;
  value: string;
  timestamp: Date;
  // extended DB fields (optional, for new entries)
  weight_kg?: number;
  waste_type_name?: string;
  buy_price_per_kg?: number;
}

interface BankSampahCalculatorProps {
  onSetor: (entry: ActivityEntry) => void;
  onTypesChanged?: () => void;
}

export default function BankSampahCalculator({ onSetor, onTypesChanged }: BankSampahCalculatorProps) {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<WasteType | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [managerOpen, setManagerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/waste-types");
      const data: WasteType[] = await res.json();
      setWasteTypes(data);
      if (data.length > 0 && !selectedWaste) setSelectedWaste(data[0]);
    } finally {
      setLoading(false);
    }
  }, [selectedWaste]);

  useEffect(() => { fetchTypes(); }, []);

  const handleTypesChanged = () => {
    fetchTypes();
    onTypesChanged?.();
  };

  const earning = selectedWaste ? selectedWaste.buy_price_per_kg * (parseFloat(weight) || 0) : 0;

  const handleSetor = useCallback(async () => {
    if (!weight || parseFloat(weight) <= 0 || !selectedWaste) return;
    setSubmitting(true);

    try {
      // Save to NeonDB
      await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          waste_type_id: selectedWaste.id,
          waste_type_name: selectedWaste.name,
          weight_kg: parseFloat(weight),
          buy_price_per_kg: selectedWaste.buy_price_per_kg,
          sell_price_per_kg: selectedWaste.sell_price_per_kg,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const entry: ActivityEntry = {
        id: `${Date.now()}`,
        type: "sampah",
        description: `Setor ${weight} kg ${selectedWaste.name}`,
        value: `Rp ${earning.toLocaleString("id-ID")}`,
        timestamp: new Date(),
        weight_kg: parseFloat(weight),
        waste_type_name: selectedWaste.name,
        buy_price_per_kg: selectedWaste.buy_price_per_kg,
      };

      onSetor(entry);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setWeight("");
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  }, [weight, selectedWaste, earning, onSetor]);

  return (
    <>
      <WasteTypeManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        onUpdated={handleTypesChanged}
      />

      <DashboardCard title="Kalkulator Setoran" badge="Interaktif" badgeColor="yellow" delay={0.25} className="col-span-1 md:col-span-2 lg:col-span-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Waste type dropdown */}
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-[#6B7280]">Jenis Sampah</p>
                <button
                  onClick={() => setManagerOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#003E87] hover:text-[#002d65] transition-colors"
                >
                  <Settings className="w-3 h-3" strokeWidth={2} />
                  Kelola Jenis
                </button>
              </div>
              <button
                id="waste-type-dropdown"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={loading || wasteTypes.length === 0}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 border-black/10 bg-white hover:border-[#003E87]/30 transition-colors text-sm font-medium text-[#000000] disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#003E87] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {selectedWaste ? (
                        <>
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{ background: (selectedWaste.color ?? "#003E87") + "20" }}
                          >
                            {selectedWaste.emoji}
                          </span>
                          {selectedWaste.name}
                        </>
                      ) : "Pilih jenis sampah"}
                    </>
                  )}
                </span>
                <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-black/8 z-50 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {wasteTypes.map((wt) => (
                      <button
                        key={wt.id}
                        onClick={() => { setSelectedWaste(wt); setDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-black/3 transition-colors ${
                          selectedWaste?.id === wt.id ? "bg-[#003E87]/5 font-semibold" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                            style={{ background: (wt.color ?? "#003E87") + "20" }}
                          >
                            {wt.emoji}
                          </span>
                          <span className="text-[#000000]">{wt.name}</span>
                        </span>
                        <span className="text-xs font-medium" style={{ color: wt.color ?? "#003E87" }}>
                          Rp {wt.buy_price_per_kg.toLocaleString("id-ID")}/kg
                        </span>
                      </button>
                    ))}
                    {/* Add shortcut */}
                    <button
                      onClick={() => { setDropdownOpen(false); setManagerOpen(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-[#003E87] hover:bg-[#003E87]/4 transition-colors border-t border-black/5"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Tambah Jenis Baru...
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Weight input */}
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#6B7280] mb-1.5">Berat (kg)</p>
              <div className="relative">
                <input
                  id="waste-weight-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="0.0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-white focus:border-[#003E87] focus:outline-none text-sm font-medium text-[#000000] transition-colors pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">kg</span>
              </div>
            </div>
          </div>

          {/* Earning preview */}
          {selectedWaste && (
            <div className="grid grid-cols-2 gap-3">
              {/* Ke anggota */}
              <div className="flex items-center justify-between bg-gradient-to-r from-[#FED501]/15 to-[#FED501]/5 rounded-2xl px-4 py-3.5 border border-[#FED501]/30">
                <div>
                  <p className="text-[10px] text-[#6B7280] font-medium mb-0.5">Saldo Anggota</p>
                  <p className="text-xl font-bold text-[#000000]">Rp {earning.toLocaleString("id-ID")}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    @ Rp {selectedWaste.buy_price_per_kg.toLocaleString("id-ID")}/kg
                  </p>
                </div>
              </div>
              {/* Estimasi surplus ke kas */}
              <div className="flex items-center justify-between bg-gradient-to-r from-[#22C55E]/10 to-[#22C55E]/5 rounded-2xl px-4 py-3.5 border border-[#22C55E]/20">
                <div>
                  <p className="text-[10px] text-[#6B7280] font-medium mb-0.5">Est. Surplus Kas</p>
                  <p className="text-xl font-bold text-[#22C55E]">
                    +Rp {((selectedWaste.sell_price_per_kg - selectedWaste.buy_price_per_kg) * (parseFloat(weight) || 0)).toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    selisih @ Rp {(selectedWaste.sell_price_per_kg - selectedWaste.buy_price_per_kg).toLocaleString("id-ID")}/kg
                  </p>
                </div>
                <Recycle className="w-7 h-7 text-[#22C55E]/30" strokeWidth={1.5} />
              </div>
            </div>
          )}

          {/* Setor button */}
          <motion.button
            id="setor-button"
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,62,135,0.25)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSetor}
            disabled={!weight || parseFloat(weight) <= 0 || submitted || submitting || !selectedWaste}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              submitted
                ? "bg-green-500 text-white"
                : !weight || parseFloat(weight) <= 0 || !selectedWaste
                ? "bg-black/10 text-[#6B7280] cursor-not-allowed"
                : "bg-[#003E87] text-white hover:bg-[#002d65] shadow-md"
            }`}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  Berhasil Disetor!
                </motion.span>
              ) : submitting ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </motion.span>
              ) : (
                <motion.span key="setor" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Setor Sampah
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </DashboardCard>
    </>
  );
}
