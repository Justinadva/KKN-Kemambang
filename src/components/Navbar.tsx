"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, User, Zap, Recycle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "plts",        label: "PLTS",        icon: Zap },
  { id: "bank-sampah", label: "Bank Sampah", icon: Recycle },
];

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo & Branding ── */}
          <div className="flex items-center gap-3 min-w-fit">
            {/* KKN-T 40 Kemambang circular logo */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#003E87]/20 flex-shrink-0">
              <Image
                src="/logo-kknt.svg"
                alt="Logo KKN-T 40 Kemambang"
                fill
                sizes="40px"
                className="object-cover"
                onError={(e) => {
                  // Fallback: hide broken img, show initials placeholder
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                priority
              />
              {/* Fallback placeholder shown behind the image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#003E87] to-[#0056BE] text-white text-[10px] font-bold select-none">
                KKN
              </div>
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-[#003E87] leading-tight tracking-tight">
                DEB Kembara
              </span>
              <span className="text-[11px] text-[#6B7280] leading-tight">
                PLTS &amp; Bank Sampah
              </span>
            </div>
          </div>

          {/* ── Desktop Nav (2 tabs only) ── */}
          <nav className="hidden md:flex items-center gap-1 bg-black/4 rounded-full p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[#003E87] text-white shadow-md"
                      : "text-[#6B7280]/70 hover:text-black hover:bg-white/60"
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
            {/* Notification bell */}
            <button
              id="notification-bell"
              aria-label="Notifikasi"
              className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <Bell className="w-5 h-5 text-[#6B7280]" strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FED501] rounded-full border-2 border-white animate-pulse-glow" />
            </button>

            {/* Avatar */}
            <button
              id="user-avatar"
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Profil Admin"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003E87] to-[#0056BE] flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="hidden sm:block text-sm font-semibold text-black">Admin</span>
            </button>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <Menu className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#003E87] text-white shadow-sm"
                        : "text-[#6B7280] hover:text-black hover:bg-black/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
