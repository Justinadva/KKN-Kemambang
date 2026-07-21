"use client";

import { useEffect, useState } from "react";
import { BatteryMedium, Plug, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import DashboardCard from "./DashboardCard";

const segments = [
  { label: "Panel Surya", pct: 78, color: "#FED501", sub: "4.42 kW aktif" },
  { label: "Baterai",     pct: 91, color: "#003E87", sub: "Penuh dalam 32 mnt" },
  { label: "Beban Rumah", pct: 55, color: "#22C55E", sub: "2.43 kW terpakai" },
];

function AnimatedBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay * 1000 + 300);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="relative h-4 bg-black/5 rounded-full overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: color }}
        initial={{ width: "0%" }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s infinite",
        }}
      />
    </div>
  );
}

export default function TotalEnergyCard() {
  return (
    <DashboardCard title="Total Energy & Charging" badge="Live" badgeColor="green" delay={0.15}>
      {/* Main stat */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-[#000000] tracking-tight">78</span>
            <span className="text-xl font-semibold text-[#FED501] mb-0.5">%</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">Kapasitas panel aktif</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Plug className="w-3.5 h-3.5" strokeWidth={2} />
            <span>12.8 kWh hari ini</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Thermometer className="w-3.5 h-3.5" strokeWidth={2} />
            <span>38°C suhu panel</span>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-3">
        {segments.map((seg, i) => (
          <div key={seg.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-xs font-medium text-[#000000]">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold" style={{ color: seg.color }}>{seg.pct}%</span>
              </div>
            </div>
            <AnimatedBar pct={seg.pct} color={seg.color} delay={i * 0.15} />
            <p className="text-[10px] text-[#6B7280] mt-1">{seg.sub}</p>
          </div>
        ))}
      </div>

      {/* Battery icon summary */}
      <div className="mt-4 flex items-center gap-2 bg-[#003E87]/5 rounded-xl px-3 py-2.5">
        <BatteryMedium className="w-4 h-4 text-[#003E87]" strokeWidth={2} />
        <span className="text-xs text-[#003E87] font-semibold">Baterai tersimpan 91% — Excellent</span>
      </div>
    </DashboardCard>
  );
}
