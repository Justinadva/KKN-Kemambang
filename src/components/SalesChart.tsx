"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { BarChart2, TrendingUp, Layers, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────────────────────────
type Period = "daily" | "weekly" | "monthly";
type ChartMode = "overview" | "penjualan" | "jenis";

interface SetoranRow {
  period_start: string;
  total_kg: number;
  total_dibayar: number;
  jumlah_transaksi: number;
}
interface PenjualanRow {
  period_start: string;
  total_kg: number;
  total_penjualan: number;
  total_surplus: number;
  jumlah_penjualan: number;
}
interface PerJenisRow {
  period_start: string;
  waste_type_name: string;
  total_kg: number;
}

interface ChartData {
  setoran: SetoranRow[];
  penjualan: PenjualanRow[];
  perJenis: PerJenisRow[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const PERIOD_LABELS: Record<Period, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

const COLOR_PALETTE = [
  "#003E87","#8B5CF6","#22C55E","#F59E0B","#06B6D4",
  "#EF4444","#EC4899","#14B8A6","#F97316","#6B7280",
];

function colorOf(name: string, idx: number): string {
  return COLOR_PALETTE[idx % COLOR_PALETTE.length];
}

function formatPeriod(iso: string, period: Period): string {
  try {
    const d = parseISO(iso);
    if (period === "monthly") return format(d, "MMM yyyy", { locale: idLocale });
    if (period === "weekly") return `${format(d, "d MMM", { locale: idLocale })}`;
    return format(d, "d MMM", { locale: idLocale });
  } catch {
    return iso.slice(0, 10);
  }
}

function rupiah(v: number) {
  return "Rp " + Math.round(v).toLocaleString("id-ID");
}

// ── Tooltip components ─────────────────────────────────────────────────────
const OverviewTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-black/8 px-4 py-3 min-w-[180px]">
      <p className="text-xs font-bold text-[#000000] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-[#000000]">
            {p.name.includes("kg") || p.name === "Setoran" ? `${p.value.toFixed(1)} kg` : rupiah(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const SurplusTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-black/8 px-4 py-3 min-w-[200px]">
      <p className="text-xs font-bold text-[#000000] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold" style={{ color: p.color }}>
            {p.name === "Volume (kg)" ? `${p.value.toFixed(1)} kg` : rupiah(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
export default function SalesChart({ refreshKey }: { refreshKey: number }) {
  const [period, setPeriod] = useState<Period>("daily");
  const [mode, setMode] = useState<ChartMode>("overview");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chart-data?period=${period}`);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  // ── Derived data ──
  // Overview: merge setoran + penjualan by period label
  const overviewData = (() => {
    if (!data) return [];
    const map = new Map<string, { label: string; setoran_kg: number; penjualan_kg: number; surplus: number }>();
    data.setoran.forEach((r) => {
      const k = r.period_start;
      const label = formatPeriod(r.period_start, period);
      if (!map.has(k)) map.set(k, { label, setoran_kg: 0, penjualan_kg: 0, surplus: 0 });
      map.get(k)!.setoran_kg += r.total_kg;
    });
    data.penjualan.forEach((r) => {
      const k = r.period_start;
      const label = formatPeriod(r.period_start, period);
      if (!map.has(k)) map.set(k, { label, setoran_kg: 0, penjualan_kg: 0, surplus: 0 });
      map.get(k)!.penjualan_kg += r.total_kg;
      map.get(k)!.surplus += r.total_surplus ?? 0;
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  })();

  // Penjualan chart
  const penjualanData = (data?.penjualan ?? []).map((r) => ({
    label: formatPeriod(r.period_start, period),
    "Volume (kg)": r.total_kg,
    "Total Penjualan": r.total_penjualan,
    "Surplus Kas": r.total_surplus ?? 0,
  }));

  // Per-jenis stacked chart
  const jenisNames = [...new Set((data?.perJenis ?? []).map((r) => r.waste_type_name))];
  const jenisData = (() => {
    const map = new Map<string, Record<string, number>>();
    (data?.perJenis ?? []).forEach((r) => {
      const label = formatPeriod(r.period_start, period);
      if (!map.has(label)) map.set(label, { label: 0 as unknown as number }); // hack
      const entry = map.get(label)!;
      entry[r.waste_type_name] = (entry[r.waste_type_name] ?? 0) + r.total_kg;
    });
    return Array.from(map.entries()).map(([label, vals]) => ({ label, ...vals }));
  })();

  const isEmpty =
    (mode === "overview" && overviewData.length === 0) ||
    (mode === "penjualan" && penjualanData.length === 0) ||
    (mode === "jenis" && jenisData.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#8B5CF6] flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#000000]">Grafik Penjualan per Periode</h2>
          <p className="text-xs text-[#6B7280]">Naik turun volume setoran & penjualan ke pengepul</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Controls */}
        <div className="flex flex-col gap-3 px-4 sm:px-6 py-4 border-b border-black/6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Mode tabs */}
            <div className="flex gap-1 bg-black/5 rounded-xl p-1">
              {(
                [
                  { key: "overview", label: "Overview", icon: <Layers className="w-3.5 h-3.5" /> },
                  { key: "penjualan", label: "Penjualan", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                  { key: "jenis", label: "Per Jenis", icon: <BarChart2 className="w-3.5 h-3.5" /> },
                ] as { key: ChartMode; label: string; icon: React.ReactNode }[]
              ).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                    mode === m.key
                      ? "bg-white text-[#000000] shadow-sm"
                      : "text-[#6B7280] hover:text-[#000000]"
                  }`}
                >
                  {m.icon}
                  <span className="hidden xs:inline sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Period toggle */}
              <div className="flex gap-1 bg-black/5 rounded-xl p-1">
                {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                      period === p
                        ? "bg-[#003E87] text-white shadow-sm"
                        : "text-[#6B7280] hover:text-[#000000]"
                    }`}
                  >
                    {p === "daily" ? "Harian" : p === "weekly" ? "Minggu" : "Bulan"}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <button
                onClick={fetchData}
                className="w-8 h-8 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#6B7280] ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#003E87] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#6B7280]">Memuat data grafik...</p>
                </div>
              </motion.div>
            ) : isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 text-center"
              >
                <BarChart2 className="w-12 h-12 text-black/10 mb-3" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-[#000000]">Belum ada data</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {mode === "penjualan"
                    ? "Belum ada penjualan ke pengepul yang tercatat."
                    : "Mulai setor sampah untuk melihat grafik perkembangan."}
                </p>
              </motion.div>
            ) : mode === "overview" ? (
              /* ── OVERVIEW: Bar (setoran) + Bar (penjualan) + Line (surplus) ── */
              <motion.div key="overview" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                {/* Legend pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { color: "#003E87", label: "Setoran (kg)" },
                    { color: "#22C55E", label: "Terjual ke Pengepul (kg)" },
                    { color: "#F59E0B", label: "Surplus Kas" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-black/4 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={overviewData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="kg"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v} kg`}
                      width={60}
                    />
                    <YAxis
                      yAxisId="rp"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
                      width={52}
                    />
                    <Tooltip content={<OverviewTooltip />} />
                    <Bar yAxisId="kg" dataKey="setoran_kg" name="Setoran" fill="#003E87" radius={[6, 6, 0, 0]} maxBarSize={40} opacity={0.85} />
                    <Bar yAxisId="kg" dataKey="penjualan_kg" name="Terjual (kg)" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={40} opacity={0.85} />
                    <Line yAxisId="rp" type="monotone" dataKey="surplus" name="Surplus" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>
            ) : mode === "penjualan" ? (
              /* ── PENJUALAN: Area chart total penjualan + surplus line ── */
              <motion.div key="penjualan" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { color: "#003E87", label: "Total Penjualan (Rp)" },
                    { color: "#22C55E", label: "Surplus ke Kas (Rp)" },
                    { color: "#8B5CF6", label: "Volume (kg)" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-black/4 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={penjualanData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="gradPenjualan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003E87" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#003E87" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="gradSurplus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="rp"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
                      width={58}
                    />
                    <YAxis
                      yAxisId="kg"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v} kg`}
                      width={52}
                    />
                    <Tooltip content={<SurplusTooltip />} />
                    <Area yAxisId="rp" type="monotone" dataKey="Total Penjualan" stroke="#003E87" strokeWidth={2.5} fill="url(#gradPenjualan)" dot={{ r: 4, fill: "#003E87", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Area yAxisId="rp" type="monotone" dataKey="Surplus Kas" stroke="#22C55E" strokeWidth={2.5} fill="url(#gradSurplus)" dot={{ r: 4, fill: "#22C55E", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Bar yAxisId="kg" dataKey="Volume (kg)" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Summary pills */}
                {penjualanData.length > 1 && (() => {
                  const last = penjualanData[penjualanData.length - 1];
                  const prev = penjualanData[penjualanData.length - 2];
                  const diffRp = last["Total Penjualan"] - prev["Total Penjualan"];
                  const diffKg = last["Volume (kg)"] - prev["Volume (kg)"];
                  return (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${diffRp >= 0 ? "bg-[#22C55E]/10 text-[#16A34A]" : "bg-red-50 text-red-500"}`}>
                        <TrendingUp className={`w-3.5 h-3.5 ${diffRp < 0 ? "rotate-180" : ""}`} strokeWidth={2.5} />
                        Periode terakhir: {diffRp >= 0 ? "+" : ""}{rupiah(diffRp)} vs sebelumnya
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${diffKg >= 0 ? "bg-[#003E87]/10 text-[#003E87]" : "bg-orange-50 text-orange-500"}`}>
                        <BarChart2 className="w-3.5 h-3.5" strokeWidth={2} />
                        {diffKg >= 0 ? "+" : ""}{diffKg.toFixed(1)} kg dari periode sebelumnya
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            ) : (
              /* ── PER JENIS: Stacked bar chart ── */
              <motion.div key="jenis" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {jenisNames.map((name, i) => (
                    <span key={name} className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-black/4 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full" style={{ background: colorOf(name, i) }} />
                      {name}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={jenisData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v} kg`}
                      width={60}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white rounded-2xl shadow-2xl border border-black/8 px-4 py-3 min-w-[180px]">
                            <p className="text-xs font-bold text-[#000000] mb-2">{label}</p>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex justify-between gap-4 text-xs mb-1">
                                <span className="flex items-center gap-1.5 text-[#6B7280]">
                                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                  {p.name}
                                </span>
                                <span className="font-bold text-[#000000]">{(p.value as number).toFixed(1)} kg</span>
                              </div>
                            ))}
                            <div className="flex justify-between gap-4 text-xs mt-1.5 pt-1.5 border-t border-black/6 font-bold">
                              <span className="text-[#6B7280]">Total</span>
                              <span>{payload.reduce((s, p) => s + (p.value as number), 0).toFixed(1)} kg</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {jenisNames.map((name, i) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        stackId="a"
                        fill={colorOf(name, i)}
                        radius={i === jenisNames.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                        maxBarSize={52}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
