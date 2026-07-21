"use client";

import { useState, useCallback } from "react";
import { Recycle, ChevronDown, Plus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardCard from "./DashboardCard";

const WASTE_TYPES = [
  { id: "plastik",  label: "Plastik",         pricePerKg: 3500,  color: "#003E87", emoji: "🧴" },
  { id: "kertas",   label: "Kertas / Kardus",  pricePerKg: 2000,  color: "#8B5CF6", emoji: "📦" },
  { id: "logam",    label: "Logam / Besi",     pricePerKg: 8000,  color: "#6B7280", emoji: "⚙️" },
  { id: "kaca",     label: "Kaca / Botol",     pricePerKg: 1500,  color: "#06B6D4", emoji: "🍶" },
  { id: "organik",  label: "Organik",          pricePerKg: 500,   color: "#22C55E", emoji: "🌿" },
];

export interface ActivityEntry {
  id: string;
  type: "sampah" | "energi";
  description: string;
  value: string;
  timestamp: Date;
}

interface BankSampahCalculatorProps {
  onSetor: (entry: ActivityEntry) => void;
}

export default function BankSampahCalculator({ onSetor }: BankSampahCalculatorProps) {
  const [selectedWaste, setSelectedWaste] = useState(WASTE_TYPES[0]);
  const [weight, setWeight] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const earning = selectedWaste.pricePerKg * (parseFloat(weight) || 0);

  const handleSetor = useCallback(() => {
    if (!weight || parseFloat(weight) <= 0) return;

    const entry: ActivityEntry = {
      id: `${Date.now()}`,
      type: "sampah",
      description: `Setor ${weight} kg ${selectedWaste.label}`,
      value: `Rp ${earning.toLocaleString("id-ID")}`,
      timestamp: new Date(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("plts-activity-log") ?? "[]");
    localStorage.setItem("plts-activity-log", JSON.stringify([entry, ...existing].slice(0, 50)));
    onSetor(entry);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setWeight("");
    }, 2000);
  }, [weight, selectedWaste, earning, onSetor]);

  return (
    <DashboardCard title="Bank Sampah Calculator" badge="Interaktif" badgeColor="yellow" delay={0.25} className="col-span-1 md:col-span-2 lg:col-span-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Waste type dropdown */}
          <div className="flex-1 relative">
            <p className="text-xs font-semibold text-[#6B7280] mb-1.5">Jenis Sampah</p>
            <button
              id="waste-type-dropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 border-black/10 bg-white hover:border-[#003E87]/30 transition-colors text-sm font-medium text-[#000000]"
            >
              <span className="flex items-center gap-2">
                <span>{selectedWaste.emoji}</span>
                {selectedWaste.label}
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
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-black/8 z-50 overflow-hidden"
                >
                  {WASTE_TYPES.map((wt) => (
                    <button
                      key={wt.id}
                      onClick={() => { setSelectedWaste(wt); setDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-black/3 transition-colors ${
                        selectedWaste.id === wt.id ? "bg-[#003E87]/5 font-semibold" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{wt.emoji}</span>
                        <span className="text-[#000000]">{wt.label}</span>
                      </span>
                      <span className="text-xs font-medium" style={{ color: wt.color }}>
                        Rp {wt.pricePerKg.toLocaleString("id-ID")}/kg
                      </span>
                    </button>
                  ))}
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
        <div className="flex items-center justify-between bg-gradient-to-r from-[#FED501]/15 to-[#FED501]/5 rounded-2xl px-5 py-4 border border-[#FED501]/30">
          <div>
            <p className="text-xs text-[#6B7280] font-medium mb-0.5">Estimasi Saldo</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-[#000000]">
                Rp {earning.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-[10px] text-[#6B7280] mt-0.5">
              {selectedWaste.emoji} {selectedWaste.label} × Rp {selectedWaste.pricePerKg.toLocaleString("id-ID")}/kg
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Recycle className="w-8 h-8 text-[#003E87]/20" strokeWidth={1.5} />
          </div>
        </div>

        {/* Setor button */}
        <motion.button
          id="setor-button"
          whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,62,135,0.25)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSetor}
          disabled={!weight || parseFloat(weight) <= 0 || submitted}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            submitted
              ? "bg-green-500 text-white"
              : !weight || parseFloat(weight) <= 0
              ? "bg-black/10 text-[#6B7280] cursor-not-allowed"
              : "bg-[#003E87] text-white hover:bg-[#002d65] shadow-md"
          }`}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" strokeWidth={2} />
                Berhasil Disetor!
              </motion.span>
            ) : (
              <motion.span
                key="setor"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Setor Sampah
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </DashboardCard>
  );
}
