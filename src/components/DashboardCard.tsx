"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface DashboardCardProps {
  title: string;
  badge?: string;
  badgeColor?: "yellow" | "blue" | "green";
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function DashboardCard({
  title,
  badge,
  badgeColor = "blue",
  children,
  className = "",
  delay = 0,
}: DashboardCardProps) {
  const badgeColors = {
    yellow: "bg-[#FED501]/20 text-[#9A7F00]",
    blue:   "bg-[#003E87]/10 text-[#003E87]",
    green:  "bg-green-100 text-green-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            {title}
          </span>
          {badge && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0">
          <ArrowUpRight className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
        </button>
      </div>

      {/* Card content */}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}
