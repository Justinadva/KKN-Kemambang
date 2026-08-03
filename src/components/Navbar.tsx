"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Zap, Recycle, Menu, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PushNotificationManager from "./PushNotificationManager";

type Role = "plts" | "bank_sampah" | "admin";

const ROLE_META: Record<Role, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  plts:        { label: "Operator PLTS",     icon: ({ className }) => <Zap className={className} />,        color: "#D97706", bg: "bg-[#FED501]/15" },
  bank_sampah: { label: "Pengurus Bank Sampah", icon: ({ className }) => <Recycle className={className} />, color: "#16A34A", bg: "bg-[#22C55E]/12" },
  admin:       { label: "Admin / Koordinator",  icon: ({ className }) => <ShieldCheck className={className} />, color: "#003E87", bg: "bg-[#003E87]/10" },
};

const ALL_NAV_ITEMS = [
  { id: "plts",        label: "PLTS",        icon: Zap,     roles: ["plts", "admin"] as Role[] },
  { id: "bank-sampah", label: "Bank Sampah", icon: Recycle, roles: ["bank_sampah", "admin"] as Role[] },
];

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: Role;
}

export default function Navbar({ activeTab, onTabChange, role }: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Filter nav items based on role
  const visibleItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo & Branding ── */}
          <div className="flex items-center gap-3 min-w-fit">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#003E87]/20 flex-shrink-0">
              <Image
                src="/logo-kknt.png"
                alt="Logo KKN-T 40 Kemambang"
                fill sizes="40px"
                className="object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#003E87] to-[#0056BE] text-white text-[10px] font-bold select-none">KKN</div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-[#003E87] leading-tight tracking-tight">DEB Kembara</span>
              <span className="text-[11px] text-[#6B7280] leading-tight">PLTS &amp; Bank Sampah</span>
            </div>
          </div>

          {/* ── Desktop Nav (filtered by role) ── */}
          <nav className="hidden md:flex items-center gap-1 bg-black/4 rounded-full p-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive ? "bg-[#003E87] text-white shadow-md" : "text-[#6B7280]/70 hover:text-black hover:bg-white/60"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-full bg-[#003E87] -z-10"
                      transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2">
            {/* Push Notification Bell */}
            <PushNotificationManager role={role} />

            {/* Role badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${meta.bg}`}>
              <span style={{ color: meta.color }}><RoleIcon className="w-3.5 h-3.5" /></span>
              <span className="text-[11px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
            </div>

            {/* Logout */}
            <button
              id="logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Keluar"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#6B7280] hover:text-red-500 hover:bg-red-50 transition-all text-xs font-medium disabled:opacity-50"
            >
              {loggingOut
                ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                : <LogOut className="w-3.5 h-3.5" />
              }
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile hamburger */}
            {visibleItems.length > 1 && (
              <button
                id="mobile-menu-toggle"
                className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5 text-[#6B7280]" /> : <Menu className="w-5 h-5 text-[#6B7280]" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-black/5 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-[#003E87] text-white shadow-sm" : "text-[#6B7280] hover:text-black hover:bg-black/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {item.label}
                  </button>
                );
              })}
              {/* Mobile: role info + logout */}
              <div className="pt-2 border-t border-black/5 mt-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${meta.bg} mb-2`}>
                  <span style={{ color: meta.color }}><RoleIcon className="w-4 h-4" /></span>
                  <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar / Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
