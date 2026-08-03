"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Recycle, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";

type Role = "plts" | "bank_sampah" | "admin";

const ROLES: { key: Role; label: string; sub: string; icon: React.FC<{ className?: string; style?: React.CSSProperties }>; color: string; bg: string; border: string }[] = [
  {
    key: "plts",
    label: "Operator PLTS",
    sub: "Monitor panel surya & IoT",
    icon: ({ className }) => <Zap className={className} />,
    color: "#FED501",
    bg: "from-[#FED501]/15 to-[#FED501]/5",
    border: "border-[#FED501]/40",
  },
  {
    key: "bank_sampah",
    label: "Pengurus Bank Sampah",
    sub: "Kelola setoran & keuangan",
    icon: ({ className }) => <Recycle className={className} />,
    color: "#22C55E",
    bg: "from-[#22C55E]/15 to-[#22C55E]/5",
    border: "border-[#22C55E]/40",
  },
  {
    key: "admin",
    label: "Admin / Koordinator",
    sub: "Akses penuh semua data",
    icon: ({ className }) => <ShieldCheck className={className} />,
    color: "#003E87",
    bg: "from-[#003E87]/15 to-[#003E87]/5",
    border: "border-[#003E87]/30",
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

  const role = ROLES.find((r) => r.key === selectedRole);

  useEffect(() => {
    if (selectedRole) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
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
    setError("");
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
    <div className="min-h-screen bg-gradient-to-br from-[#001F44] via-[#003E87] to-[#002d65] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-[#FED501]/8 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-[#22C55E]/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/2 blur-3xl" />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Logo + Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 relative z-10"
      >
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl mb-4">
          <Image src="/logo-kknt.png" alt="DEB Kembara" fill className="object-cover" sizes="80px" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">DEB Kembara</h1>
        <p className="text-white/60 text-sm mt-1">PLTS & Bank Sampah · KKN-T 40 Kemambang</p>
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
            <p className="text-center text-white/70 text-sm mb-5">Pilih peran Anda untuk masuk</p>
            <div className="flex flex-col gap-3">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                return (
                  <motion.button
                    key={r.key}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedRole(r.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${r.bg} border ${r.border} backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-left group`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ background: `${r.color}22`, border: `1.5px solid ${r.color}44` }}
                    >
                      <span style={{ color: r.color }}>
                        <Icon className="w-6 h-6" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{r.label}</p>
                      <p className="text-white/50 text-xs mt-0.5">{r.sub}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <span className="text-white/60 text-xs">›</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
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
            {/* Back button */}
            <button
              onClick={() => { setSelectedRole(null); setPin(""); setError(""); }}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ganti peran
            </button>

            {!role ? null : (<>

            {/* Role badge */}
            <div
              className={`flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r ${role!.bg} border ${role!.border} mb-6`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${role.color}22` }}>
                <span style={{ color: role.color }}><role.icon className="w-4 h-4" /></span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{role.label}</p>
                <p className="text-white/50 text-[11px]">{role.sub}</p>
              </div>
            </div>

            <p className="text-center text-white/70 text-sm mb-5">Masukkan PIN 4 digit Anda</p>

            {/* PIN dots */}
            <motion.div
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    i < pin.length
                      ? "scale-110 shadow-lg"
                      : "bg-white/20"
                  }`}
                  style={i < pin.length ? { background: role!.color, boxShadow: `0 0 12px ${role!.color}88` } : {}}
                />
              ))}
            </motion.div>

            {/* Hidden input */}
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
                className="w-full text-center text-2xl font-bold tracking-[0.5em] py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                placeholder="••••"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
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
                  className="text-red-400 text-xs text-center mt-3"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center mt-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}

            <p className="text-center text-white/30 text-[11px] mt-6">
              Hubungi koordinator KKN jika lupa PIN
            </p>
            </>)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p className="absolute bottom-4 text-white/20 text-[10px] z-10">
        DEB Kembara · KKN-T 40 · Desa Kemambang 2024
      </p>
    </div>
  );
}
