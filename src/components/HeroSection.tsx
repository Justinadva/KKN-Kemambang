"use client";

import { Sun, Leaf, TrendingUp, Battery, Thermometer, Cloud } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Suhu Panel",   value: "38°C",    icon: Thermometer, color: "#F59E0B" },
  { label: "Irradiasi",    value: "5.8 kWh", icon: Sun,         color: "#FED501" },
  { label: "Baterai",      value: "91%",     icon: Battery,     color: "#003E87" },
  { label: "CO₂ Hari Ini", value: "3.7 kg",  icon: Cloud,       color: "#22C55E" },
];

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#003E87] via-[#0050B3] to-[#0064D9] p-5 sm:p-8 mb-6 sm:mb-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-64 h-64 rounded-full bg-[#FED501]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Text content */}
        <div className="max-w-xl">
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4"
          >
            <span className="w-2 h-2 bg-[#FED501] rounded-full animate-pulse-glow" />
            <span className="text-xs font-semibold text-white">Sistem Aktif — 07:00 – 17:00 WIB</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3"
          >
            Here&apos;s Your{" "}
            <span className="text-[#FED501] relative">
              Current
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 120 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4C30 1 90 1 118 4"
                  stroke="#FED501"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </span>{" "}
            Energy Overview
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white/75 text-sm leading-relaxed mb-6"
          >
            Pantau daya PLTS, tabungan energi, dan konversi bank sampah Anda secara real-time.
            Data diperbarui setiap 5 menit.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3"
                >
                  <Icon className="w-4 h-4 mb-1.5" style={{ color: stat.color }} strokeWidth={2} />
                  <p className="text-white font-bold text-base leading-none">{stat.value}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* 3D House illustration (SVG) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex items-center justify-center flex-shrink-0"
        >
          <div className="relative w-72 h-56 animate-float">
            {/* House SVG illustration */}
            <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
              {/* Sky glow */}
              <ellipse cx="140" cy="200" rx="120" ry="18" fill="rgba(254,213,1,0.15)" />
              
              {/* House body */}
              <rect x="60" y="110" width="160" height="100" rx="6" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
              <rect x="60" y="110" width="160" height="100" rx="6" fill="url(#houseGrad)" />
              
              {/* Roof */}
              <path d="M48 115 L140 40 L232 115 Z" fill="url(#roofGrad)" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
              
              {/* Door */}
              <rect x="118" y="155" width="44" height="55" rx="4" fill="white" fillOpacity="0.25" />
              <rect x="118" y="155" width="44" height="55" rx="4" fill="#003E87" fillOpacity="0.4" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <circle cx="156" cy="183" r="3" fill="white" fillOpacity="0.8" />
              
              {/* Windows */}
              <rect x="74" y="130" width="38" height="32" rx="3" fill="white" fillOpacity="0.3" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <line x1="93" y1="130" x2="93" y2="162" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <line x1="74" y1="146" x2="112" y2="146" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              
              <rect x="168" y="130" width="38" height="32" rx="3" fill="white" fillOpacity="0.3" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <line x1="187" y1="130" x2="187" y2="162" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <line x1="168" y1="146" x2="206" y2="146" stroke="white" strokeOpacity="0.4" strokeWidth="1" />

              {/* Solar panels on roof */}
              <g transform="translate(90, 68) rotate(-35, 50, 30)">
                <rect x="0" y="0" width="24" height="16" rx="2" fill="#FED501" fillOpacity="0.9" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" />
                <line x1="12" y1="0" x2="12" y2="16" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
                <line x1="0" y1="8" x2="24" y2="8" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
              </g>
              <g transform="translate(115, 58) rotate(-35, 50, 30)">
                <rect x="0" y="0" width="24" height="16" rx="2" fill="#FED501" fillOpacity="0.9" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" />
                <line x1="12" y1="0" x2="12" y2="16" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
                <line x1="0" y1="8" x2="24" y2="8" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
              </g>
              <g transform="translate(140, 70) rotate(-35, 50, 30)">
                <rect x="0" y="0" width="24" height="16" rx="2" fill="#FED501" fillOpacity="0.9" stroke="white" strokeOpacity="0.5" strokeWidth="0.8" />
                <line x1="12" y1="0" x2="12" y2="16" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
                <line x1="0" y1="8" x2="24" y2="8" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
              </g>

              {/* Sun */}
              <circle cx="230" cy="38" r="22" fill="#FED501" fillOpacity="0.9" />
              <circle cx="230" cy="38" r="16" fill="#FED501" />
              {[0,45,90,135,180,225,270,315].map((angle, i) => (
                <line
                  key={i}
                  x1={230 + 25 * Math.cos((angle * Math.PI) / 180)}
                  y1={38 + 25 * Math.sin((angle * Math.PI) / 180)}
                  x2={230 + 30 * Math.cos((angle * Math.PI) / 180)}
                  y2={38 + 30 * Math.sin((angle * Math.PI) / 180)}
                  stroke="#FED501"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
              ))}

              {/* Energy flow lines */}
              <path d="M140 88 L140 108" stroke="#FED501" strokeWidth="2" strokeDasharray="4 3" strokeOpacity="0.7">
                <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.2s" repeatCount="indefinite" />
              </path>

              {/* Leaf icon on side */}
              <circle cx="52" cy="155" r="14" fill="#22C55E" fillOpacity="0.2" stroke="#22C55E" strokeOpacity="0.4" strokeWidth="1" />
              <text x="52" y="160" textAnchor="middle" fontSize="13">🌿</text>

              <defs>
                <linearGradient id="houseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#003E87" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0052B8" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -top-3 -right-4 bg-[#FED501] text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg"
            >
              ☀️ 4.42 kW
            </motion.div>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-2 -left-4 bg-green-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg"
            >
              🌿 892 kg CO₂
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom trend bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Produksi bulan ini: <strong className="text-white">312 kWh</strong></span>
          <span className="text-white/40">|</span>
          <Leaf className="w-3.5 h-3.5 text-green-400" strokeWidth={2} />
          <span>Bank Sampah aktif: <strong className="text-white">87 anggota</strong></span>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <span>Terakhir diperbarui:</span>
          <span className="font-semibold text-white">Hari ini, 21:43 WIB</span>
        </div>
      </motion.div>
    </div>
  );
}
