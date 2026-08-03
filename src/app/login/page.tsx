"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

type Role = "plts" | "bank_sampah" | "admin";

const ROLES: {
  key: Role; label: string; sub: string;
  emoji: string; color: string; bg: string; border: string; glow: string;
}[] = [
  {
    key: "plts",
    label: "Operator PLTS",
    sub: "Monitor panel surya & IoT",
    emoji: "⚡",
    color: "#B45309",
    bg: "from-[#FED501]/20 to-[#FED501]/5",
    border: "border-[#FED501]/50",
    glow: "shadow-[0_0_20px_rgba(254,213,1,0.15)]",
  },
  {
    key: "bank_sampah",
    label: "Pengurus Bank Sampah",
    sub: "Kelola setoran & keuangan",
    emoji: "♻️",
    color: "#15803D",
    bg: "from-[#22C55E]/20 to-[#22C55E]/5",
    border: "border-[#22C55E]/40",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.12)]",
  },
  {
    key: "admin",
    label: "Admin",
    sub: "Akses penuh semua data",
    emoji: "👑",
    color: "#1E40AF",
    bg: "from-[#003E87]/20 to-[#003E87]/5",
    border: "border-[#003E87]/30",
    glow: "shadow-[0_0_20px_rgba(0,62,135,0.15)]",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const roleData = ROLES.find((r) => r.key === selectedRole);

  useEffect(() => {
    if (selectedRole) setTimeout(() => inputRef.current?.focus(), 300);
  }, [selectedRole]);

  const handlePinChange = (val: string) => {
    if (!/^\d*$/.test(val) || val.length > 4) return;
    setPin(val);
    setError("");
    if (val.length === 4) handleSubmit(val);
  };

  const handleSubmit = async (pinVal: string) => {
    if (!selectedRole || pinVal.length !== 4) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinVal }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error ?? "PIN salah, coba lagi");
        setPin("");
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError("Gagal terhubung, cek koneksi internet");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001830] via-[#002d65] to-[#003E87] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FED501]/6 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#22C55E]/6 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-white/3 blur-2xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Logo + Title */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8 relative z-10"
      >
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl mb-4 bg-white/95">
          <Image src="/logo-kknt.png" alt="DEB Kembara" fill className="object-contain p-2" sizes="96px" priority />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">DEB Kembara</h1>
        <p className="text-white/55 text-sm mt-1 text-center">PLTS &amp; Bank Sampah · KKN-T 40 Kemambang</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          /* ── Role Selection ── */
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="w-full max-w-md relative z-10"
          >
            <p className="text-center text-white/60 text-sm mb-5 font-medium">Pilih peran Anda untuk masuk</p>
            <div className="flex flex-col gap-3">
              {ROLES.map((r, i) => (
                <motion.button
                  key={r.key}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelectedRole(r.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${r.bg} border ${r.border} ${r.glow} backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-left group`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: `${r.color}20`, border: `1.5px solid ${r.color}40` }}
                  >
                    {r.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{r.label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{r.sub}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:translate-x-0.5 transition-all">
                    <span className="text-white/70 text-sm">›</span>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-center text-white/25 text-[11px] mt-6">
              Sistem Dashboard KKN-T 40 Desa Kemambang
            </p>
          </motion.div>
        ) : (
          /* ── PIN Entry ── */
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="w-full max-w-sm relative z-10"
          >
            <button
              onClick={() => { setSelectedRole(null); setPin(""); setError(""); }}
              className="flex items-center gap-1.5 text-white/55 hover:text-white text-xs mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ganti peran
            </button>

            {roleData && (
              <>
                {/* Role badge */}
                <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${roleData.bg} border ${roleData.border} mb-7`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${roleData.color}20` }}>
                    {roleData.emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{roleData.label}</p>
                    <p className="text-white/50 text-[11px]">{roleData.sub}</p>
                  </div>
                </div>

                <p className="text-center text-white/65 text-sm mb-6 font-medium">Masukkan PIN 4 digit</p>

                {/* PIN dots */}
                <motion.div
                  animate={shake ? { x: [-10, 10, -10, 10, -6, 6, 0] } : {}}
                  transition={{ duration: 0.45 }}
                  className="flex items-center justify-center gap-5 mb-7"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={i < pin.length
                        ? { scale: 1.15, backgroundColor: roleData.color }
                        : { scale: 1, backgroundColor: "rgba(255,255,255,0.2)" }
                      }
                      transition={{ duration: 0.15 }}
                      className="w-4 h-4 rounded-full"
                      style={i < pin.length ? { boxShadow: `0 0 14px ${roleData.color}99` } : {}}
                    />
                  ))}
                </motion.div>

                {/* PIN input */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    disabled={loading}
                    className="w-full text-center text-3xl font-bold tracking-[0.6em] py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/25 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-xs text-center mt-3 font-medium"
                    >
                      ⚠ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {loading && (
                  <div className="flex justify-center mt-5">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                <p className="text-center text-white/25 text-[11px] mt-7">
                  Hubungi koordinator KKN jika lupa PIN
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="absolute bottom-4 text-white/18 text-[10px] z-10 text-center px-4">
        DEB Kembara · KKN-T 40 · Desa Kemambang 2024
      </p>
    </div>
  );
}
