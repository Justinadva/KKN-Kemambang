"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Wind, TreePine, Car } from "lucide-react";
import DashboardCard from "./DashboardCard";

function useCountUp(target: number, duration: number = 1500, delay: number = 300) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * ease));
        if (progress < 1) {
          raf.current = requestAnimationFrame(step);
        }
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return count;
}

const equivalents = [
  { icon: Car,      label: "km tidak berkendara",  value: "5.137 km",  color: "#003E87" },
  { icon: TreePine, label: "pohon ditanam setara",  value: "4 pohon",   color: "#22C55E" },
  { icon: Wind,     label: "hari udara bersih",     value: "182 hari",  color: "#06B6D4" },
];

export default function CO2SavingsCard() {
  const totalKg = useCountUp(892, 1800, 400);
  const todayKg = useCountUp(3.7, 1200, 500);

  return (
    <DashboardCard title="CO₂ Savings Total" badge="Lingkungan" badgeColor="green" delay={0.2}>
      {/* Hero number */}
      <div className="flex flex-col items-center py-2 mb-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center mb-3 animate-float mx-auto border-4 border-white shadow-lg">
            <Leaf className="w-10 h-10 text-green-500" strokeWidth={1.8} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FED501] rounded-full flex items-center justify-center shadow-md">
              <span className="text-[8px] font-bold text-black">CO₂</span>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="text-4xl font-bold text-[#000000] tracking-tight">
              {totalKg.toLocaleString("id-ID")}
            </span>
            <span className="text-base font-semibold text-green-500 mb-1">kg</span>
          </div>
          <p className="text-xs text-[#6B7280] font-medium">Total CO₂ dihemat</p>
        </div>
      </div>

      {/* Today stat */}
      <div className="flex items-center justify-between mb-4 bg-green-50 rounded-xl px-3 py-2.5">
        <span className="text-xs text-[#6B7280]">Hari ini</span>
        <span className="text-sm font-bold text-green-600">+{todayKg.toFixed(1)} kg CO₂</span>
      </div>

      {/* Equivalents */}
      <div className="flex flex-col gap-2">
        {equivalents.map((eq) => {
          const Icon = eq.icon;
          return (
            <div key={eq.label} className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${eq.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: eq.color }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#6B7280] truncate block">{eq.label}</span>
              </div>
              <span className="text-xs font-bold text-[#000000] whitespace-nowrap">{eq.value}</span>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
