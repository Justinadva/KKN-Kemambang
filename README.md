# 🌞 Dashboard PLTS & Bank Sampah — DEB Kembara

> **KKN-T 40 Kemambang** · Platform monitoring energi surya dan pengelolaan konversi bank sampah terintegrasi.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Fitur Utama

### ⚡ Tab PLTS (Energi Surya)
- **Hero Section** — Status sistem real-time dengan ilustrasi rumah berpanel surya
- **Current Power Card** — Bar chart daya surya vs daya balik (Recharts)
- **Energy Balance Today** — Semi-circular gauge energi diterima vs biaya
- **Total Energy & Charging** — Progress bar animasi panel, baterai, dan beban rumah
- **CO₂ Savings** — Counter animasi total penghematan karbon + ekuivalen km/pohon
- **Log Milestone Energi** — Riwayat pencapaian daya dengan timestamp relatif

### ♻️ Tab Bank Sampah
- **Kalkulator Setoran** — Pilih jenis sampah (Plastik, Kertas, Logam, Kaca, Organik), input berat, preview estimasi saldo otomatis
- **Tombol Setor** — Simpan ke `localStorage` dengan animasi sukses
- **Ringkasan Statistik** — Total setoran, saldo, anggota aktif, pengurangan CO₂
- **Panduan Harga** — Daftar harga per kg per jenis sampah
- **Log Setoran** — Riwayat penyetoran dengan waktu relatif (date-fns)

---

## 🛠 Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Next.js](https://nextjs.org) | 16 (App Router) | Framework utama |
| [TypeScript](https://typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | v4 (`@theme` directive) | Styling |
| [Recharts](https://recharts.org) | latest | Grafik & visualisasi |
| [Framer Motion](https://framer.motion.com) | latest | Animasi transisi |
| [Lucide React](https://lucide.dev) | latest | Ikon |
| [date-fns](https://date-fns.org) | latest | Format waktu relatif |

---

## 🎨 Design System

| Token | Nilai | Keterangan |
|-------|-------|------------|
| `--color-primary` | `#003E87` | Deep Blue — heading, tombol, tab aktif |
| `--color-accent` | `#FED501` | Yellow — grafik, badge, indikator |
| `--color-bg` | `#F8F9FA` | Background halaman |
| `--color-card` | `#FFFFFF` | Background card |
| `--color-muted` | `#6B7280` | Teks sekunder / subtitle |

---

## 🚀 Cara Menjalankan

```bash
# 1. Clone repo
git clone https://github.com/Justinadva/KKN-Kemambang.git
cd KKN-Kemambang

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev

# 4. Buka di browser
# http://localhost:3000
```

### Build Produksi
```bash
npm run build
npm start
```

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── globals.css          # Design tokens (Tailwind v4 @theme)
│   ├── layout.tsx           # Root layout + Inter font + metadata
│   └── page.tsx             # Main page — 2-tab routing (PLTS / Bank Sampah)
└── components/
    ├── Navbar.tsx            # Fixed navbar — logo KKN-T + 2 pill tabs
    ├── HeroSection.tsx       # Hero gradient + SVG ilustrasi rumah surya
    ├── DashboardCard.tsx     # Reusable card wrapper
    ├── CurrentPowerCard.tsx  # Bar chart daya surya
    ├── EnergyBalanceCard.tsx # Semi-circular gauge energi
    ├── TotalEnergyCard.tsx   # Progress bar animasi
    ├── CO2SavingsCard.tsx    # CO₂ savings counter
    ├── BankSampahCalculator.tsx  # Kalkulator interaktif
    └── ActivityLog.tsx       # Riwayat log per konteks tab
```

---

## 📋 Logo KKN-T 40 Kemambang

Tambahkan file logo di:
```
public/logo-kknt.png
```
Ukuran rekomendasi: **200×200px** (PNG transparan, lingkaran/rounded).

Jika file tidak ada, otomatis tampil fallback inisial **"KKN"** berwarna biru.

---

## 👥 Tim KKN-T 40 Kemambang

**Desa Kemambang** · Program KKN-T Universitas  
Divisi Energi Baru Terbarukan & Bank Sampah (**DEB Kembara**)

---

*© 2026 KKN-T 40 Kemambang — DEB Kembara. Dashboard PLTS & Bank Sampah.*
