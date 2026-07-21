"use client";

import { DollarSign, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import DashboardCard from "./DashboardCard";

const gaugeData = [
  { name: "Biaya", value: 38, fill: "#003E87" },
  { name: "Diterima", value: 62, fill: "#FED501" },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{name: string; value: number; payload: {fill: string}}>}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-black/5 text-xs">
        <p className="font-bold" style={{ color: payload[0].payload.fill }}>
          {payload[0].name}: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function EnergyBalanceCard() {
  const received = 28.4;
  const cost = 18.6;
  const net = received - cost;

  return (
    <DashboardCard title="Energy Balance Today" badge="Hari Ini" badgeColor="blue" delay={0.1}>
      {/* Semi-circular gauge */}
      <div className="relative h-36 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="85%"
            innerRadius="55%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={gaugeData}
            barSize={14}
          >
            <Tooltip content={<CustomTooltip />} />
            <RadialBar background={{ fill: "#F3F4F6" }} dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-1">
          <p className="text-2xl font-bold text-[#000000]">
            {net > 0 ? "+" : ""}{net.toFixed(1)}
          </p>
          <p className="text-[10px] text-[#6B7280] font-medium">kWh net</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mt-2">
        <div className="flex-1 flex items-center gap-2 bg-[#FED501]/10 rounded-xl p-3">
          <div className="w-7 h-7 rounded-lg bg-[#FED501]/30 flex items-center justify-center flex-shrink-0">
            <ArrowDownLeft className="w-4 h-4 text-[#9A7F00]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] text-[#6B7280]">Diterima</p>
            <p className="text-sm font-bold text-[#000000]">{received} kWh</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-[#003E87]/5 rounded-xl p-3">
          <div className="w-7 h-7 rounded-lg bg-[#003E87]/10 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 text-[#003E87]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] text-[#6B7280]">Biaya</p>
            <p className="text-sm font-bold text-[#000000]">{cost} kWh</p>
          </div>
        </div>
      </div>

      {/* Rp equivalent */}
      <div className="mt-3 flex items-center justify-between bg-black/3 rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
          <span className="text-xs text-[#6B7280]">Penghematan</span>
        </div>
        <span className="text-sm font-bold text-green-600">Rp 42.600</span>
      </div>
    </DashboardCard>
  );
}
