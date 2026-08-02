"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Zap, Activity, Gauge, TrendingUp, TrendingDown,
  Wifi, WifiOff, RefreshCw, AlertTriangle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface IoTReading {
  time: string;
  vCharger: number;   // Tegangan Charger (V)
  iCharger: number;   // Arus Charger (A)
  pCharger: number;   // Daya Charger (W)
  vBeban: number;     // Tegangan Beban (V)
  iBeban: number;     // Arus Beban (A)
}

// ── Simulate real-time IoT data ────────────────────────────────────────────
function generateReading(prev?: IoTReading): IoTReading {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");

  const jitter = (base: number, pct: number) =>
    parseFloat((base + (Math.random() - 0.5) * base * pct).toFixed(2));

  const vCharger = prev ? jitter(prev.vCharger, 0.03) : jitter(14.4, 0.05);
  const iCharger = prev ? jitter(prev.iCharger, 0.06) : jitter(5.2, 0.08);
  const pCharger = parseFloat((vCharger * iCharger).toFixed(2));
  const vBeban   = prev ? jitter(prev.vBeban, 0.02)   : jitter(12.1, 0.04);
  const iBeban   = prev ? jitter(prev.iBeban, 0.07)   : jitter(3.8, 0.09);

  return {
    time: `${hh}:${mm}:${ss}`,
    vCharger: Math.max(0, vCharger),
    iCharger: Math.max(0, iCharger),
    pCharger: Math.max(0, pCharger),
    vBeban:   Math.max(0, vBeban),
    iBeban:   Math.max(0, iBeban),
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

// Status badge
function StatusBadge({ online }: { online: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
      online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
    }`}>
      {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {online ? "Online" : "Offline"}
    </div>
  );
}

// Small inline tooltip
const SmallTooltip = ({ active, payload, label, unit }: {
  active?: boolean; payload?: {value: number}[]; label?: string; unit: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-black/8 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-[#6B7280] mb-0.5">{label}</p>
      <p className="font-bold text-[#003E87]">{payload[0].value.toFixed(2)} {unit}</p>
    </div>
  );
};

// Single metric card
interface MetricCardProps {
  title: string;
  subtitle: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: string;         // tailwind hex
  bgColor: string;
  history: IoTReading[];
  dataKey: keyof IoTReading;
  warning?: { min: number; max: number };
  delay?: number;
}

function MetricCard({
  title, subtitle, value, unit, icon: Icon,
  color, bgColor, history, dataKey, warning, delay = 0,
}: MetricCardProps) {
  const prev = history.length > 1 ? (history[history.length - 2][dataKey] as number) : value;
  const trend = value - prev;
  const isWarning = warning && (value < warning.min || value > warning.max);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`card p-4 sm:p-5 flex flex-col gap-3 ${isWarning ? "ring-2 ring-orange-400" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color }} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#6B7280] truncate">{title}</p>
            <p className="text-[10px] text-[#9CA3AF] truncate">{subtitle}</p>
          </div>
        </div>
        {isWarning && (
          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
        )}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color }}>
              {value.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#6B7280]">{unit}</span>
          </div>
          {/* Trend */}
          <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium ${
            trend >= 0 ? "text-green-500" : "text-red-400"
          }`}>
            {trend >= 0
              ? <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
              : <TrendingDown className="w-3 h-3" strokeWidth={2.5} />}
            <span>{trend >= 0 ? "+" : ""}{trend.toFixed(2)} {unit}</span>
          </div>
        </div>
      </div>

      {/* Mini chart */}
      <div className="h-16 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey as string}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Tooltip content={<SmallTooltip unit={unit} />} />
            {warning && (
              <>
                <ReferenceLine y={warning.max} stroke="#F59E0B" strokeDasharray="3 2" strokeWidth={1} />
                <ReferenceLine y={warning.min} stroke="#F59E0B" strokeDasharray="3 2" strokeWidth={1} />
              </>
            )}
            <Area
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${dataKey as string})`}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Warning label */}
      {isWarning && (
        <p className="text-[10px] text-orange-500 font-medium">
          ⚠ Di luar rentang normal ({warning.min}–{warning.max} {unit})
        </p>
      )}
    </motion.div>
  );
}

// Combined line chart for overview
function OverviewChart({ history }: { history: IoTReading[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#000000]">Grafik Realtime IoT PLTS</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Semua parameter dalam satu tampilan</p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {[
            { key: "vCharger", label: "V Charger", color: "#003E87" },
            { key: "iCharger", label: "I Charger", color: "#FED501" },
            { key: "pCharger", label: "P Charger", color: "#8B5CF6" },
            { key: "vBeban",   label: "V Beban",   color: "#22C55E" },
            { key: "iBeban",   label: "I Beban",   color: "#F59E0B" },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] text-[#6B7280]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-48 sm:h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "white", border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: "12px", fontSize: "11px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "#6B7280", fontWeight: 600, marginBottom: 4 }}
            />
            <Line type="monotone" dataKey="vCharger" stroke="#003E87" strokeWidth={2} dot={false} name="V Charger (V)" />
            <Line type="monotone" dataKey="iCharger" stroke="#FED501" strokeWidth={2} dot={false} name="I Charger (A)" />
            <Line type="monotone" dataKey="pCharger" stroke="#8B5CF6" strokeWidth={2} dot={false} name="P Charger (W)" />
            <Line type="monotone" dataKey="vBeban"   stroke="#22C55E" strokeWidth={2} dot={false} name="V Beban (V)" />
            <Line type="monotone" dataKey="iBeban"   stroke="#F59E0B" strokeWidth={2} dot={false} name="I Beban (A)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const MAX_HISTORY = 30;

export default function IotPLTSMonitor() {
  const [history, setHistory] = useState<IoTReading[]>([]);
  const [online, setOnline]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushReading = (prev: IoTReading[]) => {
    const latest = generateReading(prev[prev.length - 1]);
    const next = [...prev, latest].slice(-MAX_HISTORY);
    setLastUpdate(latest.time);
    return next;
  };

  useEffect(() => {
    // Initial seeding
    const seed: IoTReading[] = [];
    let r: IoTReading | undefined;
    for (let i = 0; i < 20; i++) { r = generateReading(r); seed.push(r); }
    setHistory(seed);
    setLastUpdate(seed[seed.length - 1].time);

    // Real-time update every 3 seconds
    intervalRef.current = setInterval(() => {
      setHistory((prev) => {
        setOnline(Math.random() > 0.05); // 95% uptime simulation
        return pushReading(prev);
      });
    }, 3000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setHistory((prev) => pushReading(prev));
      setRefreshing(false);
    }, 600);
  };

  const latest = history[history.length - 1];

  if (!latest) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-[#003E87] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const metrics: MetricCardProps[] = [
    {
      title: "Tegangan Charger",
      subtitle: "Voltase dari panel surya ke baterai",
      value: latest.vCharger,
      unit: "V",
      icon: Zap,
      color: "#003E87",
      bgColor: "#EFF6FF",
      dataKey: "vCharger",
      history,
      warning: { min: 12.0, max: 16.0 },
      delay: 0.05,
    },
    {
      title: "Arus Charger",
      subtitle: "Arus pengisian dari solar ke baterai",
      value: latest.iCharger,
      unit: "A",
      icon: Activity,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
      dataKey: "iCharger",
      history,
      warning: { min: 0.5, max: 10.0 },
      delay: 0.1,
    },
    {
      title: "Daya Charger",
      subtitle: "P = V × I (daya masuk ke baterai)",
      value: latest.pCharger,
      unit: "W",
      icon: Gauge,
      color: "#FED501",
      bgColor: "#FEFCE8",
      dataKey: "pCharger",
      history,
      warning: { min: 5, max: 160 },
      delay: 0.15,
    },
    {
      title: "Tegangan Beban",
      subtitle: "Voltase output ke perangkat/rumah",
      value: latest.vBeban,
      unit: "V",
      icon: Zap,
      color: "#22C55E",
      bgColor: "#F0FDF4",
      dataKey: "vBeban",
      history,
      warning: { min: 10.5, max: 14.5 },
      delay: 0.2,
    },
    {
      title: "Arus Beban",
      subtitle: "Arus yang dikonsumsi oleh beban",
      value: latest.iBeban,
      unit: "A",
      icon: Activity,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      dataKey: "iBeban",
      history,
      warning: { min: 0, max: 15.0 },
      delay: 0.25,
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Top status bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3 border border-black/5 shadow-sm"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge online={online} />
          <div className="h-4 w-px bg-black/10 hidden sm:block" />
          <p className="text-xs text-[#6B7280]">
            Terakhir diperbarui: <span className="font-semibold text-[#000000]">{lastUpdate}</span>
          </p>
          <div className="h-4 w-px bg-black/10 hidden sm:block" />
          <p className="text-xs text-[#6B7280]">
            Interval update: <span className="font-semibold text-[#000000]">3 detik</span>
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#003E87] hover:bg-[#003E87]/8 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.5} />
          Refresh
        </button>
      </motion.div>

      {/* ── 5 metric cards — responsive grid ── */}
      {/* Mobile: 1 col | sm: 2 col | lg: 3 col | xl: 5 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.dataKey as string} {...m} />
        ))}
      </div>

      {/* ── Overview chart ── */}
      <OverviewChart history={history} />

      {/* ── Summary row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
      >
        {[
          { label: "Efisiensi Pengisian", value: `${((latest.pCharger / (latest.vCharger * latest.iCharger + 0.001)) * 100).toFixed(1)}%`, color: "#003E87" },
          { label: "Daya Beban",          value: `${(latest.vBeban * latest.iBeban).toFixed(1)} W`, color: "#22C55E" },
          { label: "Selisih Tegangan",    value: `${(latest.vCharger - latest.vBeban).toFixed(2)} V`, color: "#8B5CF6" },
          { label: "P Surplus",           value: `${(latest.pCharger - latest.vBeban * latest.iBeban).toFixed(1)} W`, color: "#F59E0B" },
          { label: "Status Sistem",       value: online ? "Normal ✓" : "Cek Koneksi!", color: online ? "#22C55E" : "#EF4444" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl p-3 sm:p-4 border border-black/5 shadow-sm"
          >
            <p className="text-[10px] text-[#6B7280] font-medium mb-1 leading-tight">{item.label}</p>
            <p className="text-sm sm:text-base font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
