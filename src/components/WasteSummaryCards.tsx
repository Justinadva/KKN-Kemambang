"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Scale, TrendingUp } from "lucide-react";

interface PerTypeData {
  waste_type_name: string;
  total_kg: number;
  total_buy_value: number;
  transaction_count: number;
}

interface WasteSummaryCardsProps {
  perType: PerTypeData[];
  totalKg: number;
  totalBuyValue: number;
}

// Generate deterministic color from name
function colorFromName(name: string): string {
  const palette = ["#003E87","#8B5CF6","#22C55E","#F59E0B","#06B6D4","#EF4444","#EC4899","#14B8A6","#F97316","#6B7280"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: PerTypeData }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-black/8 px-4 py-3 text-xs">
      <p className="font-bold text-[#000000] mb-1">{d.waste_type_name}</p>
      <p className="text-[#6B7280]">{d.total_kg.toFixed(1)} kg</p>
      <p className="text-[#003E87] font-semibold">Rp {d.total_buy_value.toLocaleString("id-ID")}</p>
    </div>
  );
};

export default function WasteSummaryCards({ perType, totalKg, totalBuyValue }: WasteSummaryCardsProps) {
  const chartData = perType.map((d) => ({
    ...d,
    color: colorFromName(d.waste_type_name),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5"
    >
      {/* Summary stats */}
      <div className="lg:col-span-1 flex flex-col gap-3">
        {/* Total kg */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003E87] flex items-center justify-center flex-shrink-0">
            <Scale className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] font-medium">Total Sampah Terkumpul</p>
            <p className="text-2xl font-extrabold text-[#000000]">{totalKg.toFixed(1)} <span className="text-sm font-semibold text-[#6B7280]">kg</span></p>
          </div>
        </div>

        {/* Total nilai ke warga */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#22C55E] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] font-medium">Total Dibayar ke Anggota</p>
            <p className="text-xl font-extrabold text-[#000000]">
              Rp {totalBuyValue.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Per-type mini list */}
        <div className="card p-5 flex-1">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Per Jenis</p>
          <div className="flex flex-col gap-2.5">
            {perType.length === 0 && (
              <p className="text-xs text-[#6B7280] text-center py-4">Belum ada data setoran</p>
            )}
            {perType.map((d) => {
              const pct = totalKg > 0 ? (d.total_kg / totalKg) * 100 : 0;
              const col = colorFromName(d.waste_type_name);
              return (
                <div key={d.waste_type_name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#000000]">{d.waste_type_name}</span>
                    <span className="font-bold" style={{ color: col }}>{d.total_kg.toFixed(1)} kg</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: col }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="md:col-span-2 card p-4 sm:p-6">
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Distribusi Berat per Jenis Sampah</p>
        <p className="text-xs text-[#6B7280] mb-4">Total kilogram terkumpul sejak program dimulai</p>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-[#6B7280]">
            Belum ada data setoran
          </div>
        ) : (
          <div className="h-44 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 24 }}>
                <XAxis
                  dataKey="waste_type_name"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={48}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}kg`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_kg" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((d) => (
                    <Cell key={d.waste_type_name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
