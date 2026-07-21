"use client";

import { Sun, TrendingUp, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import DashboardCard from "./DashboardCard";

const powerData = [
  { time: "08:00", sun: 2.1, grid: 1.8 },
  { time: "09:00", sun: 3.0, grid: 2.5 },
  { time: "10:00", sun: 3.8, grid: 3.2 },
  { time: "11:00", sun: 4.2, grid: 3.9 },
  { time: "12:00", sun: 4.42, grid: 4.0 },
  { time: "13:00", sun: 4.45, grid: 4.1 },
  { time: "14:00", sun: 4.3,  grid: 3.8 },
  { time: "15:00", sun: 3.5,  grid: 3.1 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-black/5 text-xs">
        <p className="font-semibold text-[#6B7280] mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-bold text-[#003E87]">
            {entry.name === "sun" ? "☀️ " : "⚡ "}
            {entry.value.toFixed(2)} kW
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CurrentPowerCard() {
  return (
    <DashboardCard title="Current Power (PLTS)" badge="Real-time" badgeColor="yellow" delay={0.05}>
      {/* Metrics Row */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#FED501]/20 flex items-center justify-center">
              <Sun className="w-4 h-4 text-[#B38800]" strokeWidth={2} />
            </div>
            <span className="text-xs text-[#6B7280] font-medium">Sun</span>
          </div>
          <span className="text-3xl font-bold text-[#000000] tracking-tight">4.42</span>
          <span className="text-sm text-[#6B7280] ml-1">kW</span>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <span className="text-xs text-[#6B7280] font-medium">Returns</span>
            <div className="w-7 h-7 rounded-lg bg-[#003E87]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#003E87]" strokeWidth={2} />
            </div>
          </div>
          <span className="text-3xl font-bold text-[#003E87] tracking-tight">4.45</span>
          <span className="text-sm text-[#6B7280] ml-1">kW</span>
        </div>
      </div>

      {/* Trend badge */}
      <div className="flex items-center gap-1 mb-3">
        <TrendingUp className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
        <span className="text-xs text-green-600 font-semibold">+12.3% dari kemarin</span>
      </div>

      {/* Mini Bar Chart */}
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={powerData} barGap={2} barSize={14}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 4 }} />
            <Bar dataKey="sun" radius={[3, 3, 0, 0]}>
              {powerData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === powerData.length - 2 ? "#FED501" : "#FED501/60"}
                  fillOpacity={index === powerData.length - 2 ? 1 : 0.55}
                />
              ))}
            </Bar>
            <Bar dataKey="grid" radius={[3, 3, 0, 0]}>
              {powerData.map((_, index) => (
                <Cell
                  key={`cell-g-${index}`}
                  fill={index === powerData.length - 2 ? "#003E87" : "#003E87"}
                  fillOpacity={index === powerData.length - 2 ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FED501]" />
          <span className="text-[10px] text-[#6B7280]">Daya Surya</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#003E87]" />
          <span className="text-[10px] text-[#6B7280]">Daya Balik</span>
        </div>
      </div>
    </DashboardCard>
  );
}
